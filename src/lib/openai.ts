import OpenAI from 'openai'
const { GoogleGenerativeAI } = require("@google/generative-ai");


const c_prompt = `1. Keep all keys unchanged.
    2. Only translate value parts.
    3. Keep JSON format valid.
    4. Preserve all special characters and formats.    
    `;

export async function translate(
  text: string,
  targetLang: string,
  apiKey: string,
  baseUrl: string,
  modelName: string,
  apiType: string,
  signal?: AbortSignal,
  customPrompt?: string,
  onProgress?: (progress: number) => void,
  onStream?: (chunk: string) => void
) {
  console.log(`${customPrompt}`);
  // return;
  switch (apiType) {
    case "openAi":
      return await translateByOpenAi(text, targetLang, apiKey, baseUrl, modelName, signal, customPrompt, onProgress, onStream);
      break;
    case "gemini":
      return await translateByGemini(text, targetLang, apiKey, modelName, signal, customPrompt, onProgress, onStream);
      break;
  }
  return;
}

export async function validateApiKey(apiKey: string,
  baseUrl: string,
  modelName: string,
  apiType: string,): Promise<boolean> {
  let re = false;
  switch (apiType) {
    case "openAi":
      re = await validateApiKeyByOpenAi(apiKey, baseUrl, modelName);
      break;
    case "gemini":
      re = await validateApiKeyByGemini(apiKey, modelName);
      break;
  }

  return re;
}

export async function translateByGemini(
  text: string,
  targetLang: string,
  apiKey: string,
  modelName: string,
  signal?: AbortSignal,
  customPrompt?: string,
  onProgress?: (progress: number) => void,
  onStream?: (chunk: string) => void
) {
  if (!apiKey) {
    throw new Error("API Key is required");
  }

  const gemini = new GoogleGenerativeAI(apiKey);
  const model = gemini.getGenerativeModel({
    model: modelName, generationConfig: {
      responseMimeType: "application/json",
    }
  });

  try {
    const prompt = `Please translate the following JSON content to ${targetLang}, keeping the JSON structure unchanged. Only translate the value part.
    Note:
    ${c_prompt}
    ${customPrompt ? customPrompt : ''}
    JSON content:
    ${text}`;
    const response = await model.generateContentStream(prompt);

    let fullContent = "";
    let tokenCount = 0;
    const estimatedTokens = text.length / 4; // 估算 token 数量

    for await (const chunk of response.stream) {
      if (signal?.aborted) {
        return fullContent;
      }

      const content = chunk.text();
      fullContent += content;
      tokenCount += content.length / 4;

      // 计算进度
      const progress = Math.min(Math.round((tokenCount / estimatedTokens) * 100), 100);
      onProgress?.(progress);

      onStream?.(fullContent);
    }

    // 校验 JSON 格式
    try {
      console.log(fullContent);
      const parsedJson = JSON.parse(fullContent);
      fullContent = JSON.stringify(parsedJson, null, 2);
    } catch (e) {
      if (signal?.aborted) {
        return "";
      }
      throw new Error(`Invalid translation result format: ${(e as Error).message}`);
    }

    return fullContent;
  } catch (error) {
    if (signal?.aborted) {
      return "";
    }

    throw error;
  }
}

export async function validateApiKeyByGemini(apiKey: string, modelName: string): Promise<boolean> {
  // if (!apiKey) {
  //   throw new Error("API Key is required");
  // }

  const gemini = new GoogleGenerativeAI(apiKey);
  const model = gemini.getGenerativeModel({ model: modelName });

  try {
    await model.generateContent({
      contents: [{ role: "user", parts: [{ text: "test" }] }],
    });
    return true;
  } catch (error) {
    throw new Error("Invalid or expired API Key");
  }
}


export async function translateByOpenAi(
  text: string,
  targetLang: string,
  apiKey: string,
  baseUrl: string,
  modelName: string,
  signal?: AbortSignal,
  customPrompt?: string,
  onProgress?: (progress: number) => void,
  onStream?: (chunk: string) => void
) {
  if (!apiKey.startsWith('sk-')) {
    throw new Error('Invalid API Key format')
  }

  const openai = new OpenAI({
    baseURL: baseUrl,
    apiKey,
    dangerouslyAllowBrowser: true
  })

  try {
    const prompt = `Please translate the following JSON content to ${targetLang}, keep the JSON structure unchanged, only translate the value part.
    Note:
    ${c_prompt}
    ${customPrompt ? customPrompt : ''}
    JSON content:
    ${text}`

    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: "system",
          content: "You are a professional JSON translation assistant. Please return the translated JSON content directly, without adding any markdown tags or other formats."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      stream: true
    }, {
      signal
    })

    let fullContent = ''
    let tokenCount = 0
    const estimatedTokens = text.length / 4 // Estimate total token count

    for await (const chunk of response) {
      const content = chunk.choices[0]?.delta?.content || ''
      fullContent += content
      tokenCount += content.length / 4

      // Calculate current progress
      const progress = Math.min(Math.round((tokenCount / estimatedTokens) * 100), 100)
      onProgress?.(progress)

      onStream?.(fullContent)
    }

    // Validate final JSON format
    try {
      const parsedJson = JSON.parse(fullContent)
      fullContent = JSON.stringify(parsedJson, null, 2)
    } catch (e) {
      if (signal?.aborted) {
        return ''
      }
      throw new Error(`Invalid translation result format: ${(e as Error).message}`)
    }

    return fullContent

  } catch (error: unknown) {
    if (signal?.aborted || (error instanceof DOMException && error.name === 'AbortError')) {
      return ''
    }

    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        throw new Error('Invalid or expired API Key')
      }

      if (error.status === 429) {
        throw new Error('API call limit reached')
      }
    }

    throw error
  }
}

export async function validateApiKeyByOpenAi(apiKey: string,
  baseUrl: string,
  modelName: string,): Promise<boolean> {
  if (!apiKey.startsWith('sk-')) {
    throw new Error('Invalid API Key format')
  }

  console.log("验证成功");
  const openai = new OpenAI({
    baseURL: baseUrl,
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
  })

  try {
    // Send a minimal request to validate the API key
    await openai.chat.completions.create({
      model: modelName,
      messages: [{ role: "user", content: "test" }],
      max_tokens: 1
    })
    return true
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        throw new Error('Invalid or expired API Key')
      }
      if (error.status === 429) {
        throw new Error('API call limit reached')
      }
    }
    throw error
  }
}


