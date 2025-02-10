import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useTranslate } from "@/context/TranslateContext";
import { KeyIcon, ChevronDown, Plus, Trash } from "lucide-react";
import PromptSetting from "@/components/Prompt";

type ModelDataType = {
    [key: string]: {
        baseUri: string;
        apikey: string;
        type: string;
        models: string[];
    };
};


const modelData: ModelDataType = {
    'deepseek': {
        baseUri: "https://api.deepseek.com",
        apikey: "",
        type: "openAi",
        models: ["deepseek-chat", "deepseek-reasoner"],
    },
    '硅基流动': {
        baseUri: "https://api.siliconflow.cn/v1",
        type: "openAi",
        apikey: "",
        models: ["deepseek-ai/DeepSeek-V3", "deepseek-ai/DeepSeek-R1"],
    },
    '腾讯云': {
        baseUri: "https://api.lkeap.cloud.tencent.com/v1",
        type: "openAi",
        apikey: "",
        models: ["deepseek-v3", "deepseek-r1"],
    },
    'gemini': {
        baseUri: "",
        type: "gemini",
        apikey: "",
        models: ["gemini-2.0-flash"],
    },
};


export default function ModelSelect({ apiKeyTip, apiKeyTitle, apiKeyPlaceholder }: {
    apiKeyTip: string;
    apiKeyTitle: string;
    apiKeyPlaceholder: string;
}) {
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
    const [selectedModel, setSelectedModel] = useState<string | null>(null);
    const { apiKey, setApiKey, baseUri, setbaseUri, modelName, setmodelName, setapiType, customPrompt, setCustomPrompt } = useTranslate();
  
    const setValue = (selectedPlatform: string, selectedModel: string) => {
        if (typeof window == "undefined") return;
        localStorage.setItem("selectedPlatform", selectedPlatform); // 存入本地存储
        let apiKey = localStorage.getItem(`${selectedPlatform}-apiKey`); // 获取本地储存的apikey
        setmodelName(selectedModel);
        setApiKey(apiKey ?? '');
        setapiType(modelData[selectedPlatform].type);
        setbaseUri(modelData[selectedPlatform].baseUri);
    };

    // 当用户选择平台时
    const handlePlatformChange = (value: string) => {
        setSelectedPlatform(value);
        // 选择该平台的第一个模型
        const firstModel = modelData[value]?.models[0] || '';

        setValue(value, firstModel);
        if (firstModel) {
            handleModelChange(firstModel);
        }
    };

    // 当用户选择模型时
    const handleModelChange = (value: string) => {
        setSelectedModel(value);
        if (typeof window !== "undefined")
            localStorage.setItem("selectedModel", value); // 存入本地存储
    };

    // 确保当平台被清空时，模型也被清空
    useEffect(() => {
        if (!selectedPlatform) {
            setSelectedModel(null);
            localStorage.removeItem("selectedModel");
        }
    }, [selectedPlatform]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedPlatform = localStorage.getItem("selectedPlatform") || "deepseek";
            setSelectedPlatform(storedPlatform);
            const storedModel = localStorage.getItem("selectedModel") || modelData[storedPlatform]?.models[0] || null;         
            setSelectedModel(storedModel);
            setValue(storedPlatform, storedModel ?? '');
        }
    }, []);

    return (
        <div className="flex flex-col pb-2">
            {/* 选择平台 */}
            <Select value={selectedPlatform ?? undefined} onValueChange={handlePlatformChange}>
                <SelectTrigger>
                    <SelectValue placeholder="选择平台" className="mt-2" />
                </SelectTrigger>
                <SelectContent>
                    {Object.keys(modelData).map((platform) => (
                        <SelectItem key={platform} value={platform}>
                            {platform}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* 选择模型 */}
            <Select onValueChange={handleModelChange} value={selectedModel ?? undefined} disabled={!selectedPlatform}>
                <SelectTrigger className="mt-2">
                    <SelectValue placeholder={selectedPlatform ? "选择模型" : "请先选择平台"} />
                </SelectTrigger>
                <SelectContent>
                    {selectedPlatform &&
                        modelData[selectedPlatform].models.map((model) => (
                            <SelectItem key={model} value={model}>
                                {model}
                            </SelectItem>
                        ))}
                </SelectContent>
            </Select>

            {/* 显示当前选择 */}
            {selectedPlatform && selectedModel && (
                <div className="p-2 border rounded bg-gray-100 mt-2">
                    <p>当前选择：</p>
                    <p>🔹 平台：{selectedPlatform}</p>
                    <p>🔹 模型：{modelName}</p>
                    <p>🔹 baseUri：{baseUri}</p>
                    <p>🔹 类型：{modelData[selectedPlatform].type}</p>
                </div>
            )}

            <div className="mt-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <KeyIcon className="w-5 h-5" />
                    {apiKeyTitle || "API Key"}
                </h2>
                <p className="text-xs text-muted-foreground pb-2">
                    {apiKeyTip || "Tips: API Key is required for translation."}
                </p>
                <Input
                    type="password"
                    placeholder={apiKeyPlaceholder || "sk-..."}
                    className="mt-1 shadow-none"
                    value={apiKey}
                    onChange={(e) => {
                        if (typeof window !== "undefined")
                            localStorage.setItem(`${selectedPlatform}-apiKey`, e.target.value); // 获取本地储存的apikey
                        setApiKey(e.target.value);
                    }}
                />
            </div>

            <PromptSetting setCustomPrompt={setCustomPrompt}
            />
        </div>
    );
}

