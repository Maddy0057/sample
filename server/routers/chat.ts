import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const chatRouter = router({
  // Generate text response using Gemini
  generateText: protectedProcedure
    .input(z.object({
      prompt: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Always persist the user's message first
      await ctx.supabase.from('chat_history').insert({
        user_id: ctx.user.id,
        role: 'user',
        content: input.prompt,
      });

      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(input.prompt);
        const response = await result.response;
        const text = response.text();

        // Persist model response
        await ctx.supabase.from('chat_history').insert({
          user_id: ctx.user.id,
          role: 'model',
          content: text,
        });

        return { response: text };
      } catch (error) {
        const fallback = 'Sorry, I could not generate a response right now. Please try again.';
        // Persist error message as model response so the user sees something
        await ctx.supabase.from('chat_history').insert({
          user_id: ctx.user.id,
          role: 'model',
          content: fallback,
        });
        return { response: fallback };
      }
    }),

  // Generate image using Hugging Face Inference API and return base64 data URL
  generateImage: protectedProcedure
    .input(z.object({
      prompt: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Save user image generation request first
      await ctx.supabase.from('chat_history').insert({
        user_id: ctx.user.id,
        role: 'user',
        content: `/imagine ${input.prompt}`,
      });

      const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
      if (!HUGGINGFACE_API_KEY) {
        const msg = 'Image generation is not configured (missing HUGGINGFACE_API_KEY).';
        await ctx.supabase.from('chat_history').insert({
          user_id: ctx.user.id,
          role: 'model',
          content: msg,
        });
        return { imageUrl: null, prompt: input.prompt };
      }

      const preferred = process.env.HUGGINGFACE_IMAGE_MODEL;
      const candidates = [
        ...(preferred ? [preferred] : []),
        'stabilityai/sdxl-turbo',
        'runwayml/stable-diffusion-v1-5',
        'stabilityai/stable-diffusion-2-1',
      ];

      try {
        let dataUrl: string | null = null;
        let lastError: string | undefined;

        for (const modelId of candidates) {
          let attempt = 0;
          const maxAttempts = 3;

          while (attempt < maxAttempts) {
            attempt += 1;
            const res = await fetch(`https://api-inference.huggingface.co/models/${modelId}`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
                  'Content-Type': 'application/json',
                  Accept: 'image/png',
                  'X-Wait-For-Model': 'true',
                },
                body: JSON.stringify({ inputs: input.prompt }),
              },
            );

            const contentType = res.headers.get('content-type') || '';

            if (res.ok && contentType.startsWith('image/')) {
              const arrayBuffer = await res.arrayBuffer();
              const base64 = Buffer.from(arrayBuffer).toString('base64');
              dataUrl = `data:${contentType};base64,${base64}`;
              break;
            }

            // Parse possible JSON error (e.g., 503 warmup or model gated)
            let json: any = undefined;
            try {
              json = await res.json();
            } catch (_) {
              // ignore
            }

            if (res.status === 503) {
              const waitMs = Math.ceil((json?.estimated_time || 2) * 1000);
              await sleep(waitMs);
              continue;
            }

            if (res.status === 404) {
              // Try next candidate model
              lastError = `Model not found: ${modelId}`;
              break;
            }

            lastError = json?.error || `HTTP ${res.status}`;
            break;
          }

          if (dataUrl) break; // success for this model
          // If attempt loop ended without success and status was 404, move to next model
          if (lastError && lastError.startsWith('Model not found')) continue;
        }

        if (!dataUrl) {
          throw new Error(lastError || 'No image data');
        }

        await ctx.supabase.from('chat_history').insert({
          user_id: ctx.user.id,
          role: 'model',
          content: `Generated image: ${dataUrl}`,
        });

        return { imageUrl: dataUrl, prompt: input.prompt };
      } catch (error: any) {
        const fallbackText = `Sorry, I could not generate an image right now. (${error?.message || 'Unknown error'})`;
        await ctx.supabase.from('chat_history').insert({
          user_id: ctx.user.id,
          role: 'model',
          content: fallbackText,
        });
        return { imageUrl: null, prompt: input.prompt };
      }
    }),

  // Get chat history for authenticated user
  getChatHistory: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', ctx.user.id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }),
});
