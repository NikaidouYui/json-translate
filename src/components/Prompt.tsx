import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Plus, Trash } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// 默认提示词的key
const DEFAULT_PROMPTS = {
  DEFAULT: "默认提示词",
  I18N: "I18N插件翻译"
};

// 默认提示词
const defCustomPrompt = `这是一个翻译的多语言字典,你需要检查键值对,并判断是否参数名字,保留参数名称
    1. 保持所有键不变。
    2. 只翻译值部分。
    3. 保持JSON格式有效。
    4. 保留所有特殊字符和格式。
    5. 只翻译字符串格式的内容。
    6. 检查字符串的内容,只翻译有意义的文字`;

export type PromptSelectDataType = {
  [key: string]: {
    name: string;
    prompt: string;
  };
};

interface Props {
  setCustomPrompt: (prompt: string) => void;
}

export default function PromptSetting({ setCustomPrompt }: Props) {
  const [showCustomPrompt, setShowCustomPrompt] = useState<boolean>(false);
  const [showAddPrompt, setShowAddPrompt] = useState<boolean>(false); // 新增state
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("selectedPrompt") || DEFAULT_PROMPTS.I18N;
  });
  const [newPromptName, setNewPromptName] = useState<string>("");
  const [newPromptContent, setNewPromptContent] = useState<string>("");
  const [customPrompts, setCustomPrompts] = useState<PromptSelectDataType>(() => {
    if (typeof window === "undefined") return {};
    const storedCustomPrompts = JSON.parse(localStorage.getItem(`customPrompts`) || "{}");
    const defaultPrompts = {
      [DEFAULT_PROMPTS.DEFAULT]: {
        name: DEFAULT_PROMPTS.DEFAULT,
        prompt: ''
      },
      [DEFAULT_PROMPTS.I18N]: {
        name: DEFAULT_PROMPTS.I18N,
        prompt: defCustomPrompt
      },
    };
    return Object.keys(storedCustomPrompts).length
      ? { ...defaultPrompts, ...storedCustomPrompts }
      : defaultPrompts;
  });

  const handleAddPrompt = () => {
    if (!newPromptName || !newPromptContent) return;

    const newPrompts = {
      ...customPrompts,
      [newPromptName]: {
        name: newPromptName,
        prompt: newPromptContent
      }
    };

    // 更新提示词列表
    setCustomPrompts(newPrompts);
    localStorage.setItem('customPrompts', JSON.stringify(newPrompts));

    // 选中新添加的提示词
    setSelectedPrompt(newPromptName);
    setCustomPrompt(newPromptContent);
    localStorage.setItem("selectedPrompt", newPromptName);

    // 清空输入框并隐藏添加窗口
    setNewPromptName("");
    setNewPromptContent("");
    setShowAddPrompt(false);
  };

  // 修改删除函数，增加默认提示词判断
  const handleRemovePrompt = () => {
    if (!selectedPrompt) return;
    // 禁止删除默认提示词
    if (Object.values(DEFAULT_PROMPTS).includes(selectedPrompt)) {
      alert("默认提示词不能删除！");
      return;
    }
    const newPrompts = { ...customPrompts };
    delete newPrompts[selectedPrompt];
    setCustomPrompts(newPrompts);
    localStorage.setItem(`customPrompts`, JSON.stringify(newPrompts));
    setSelectedPrompt(DEFAULT_PROMPTS.I18N); // 删除后选中默认提示词
    setCustomPrompt(customPrompts[DEFAULT_PROMPTS.I18N].prompt);
    localStorage.setItem("selectedPrompt", DEFAULT_PROMPTS.I18N);
  };

  const handlePromptChange = (value: string) => {
    if (!selectedPrompt) return;
    const newPrompts = {
      ...customPrompts,
      [selectedPrompt]: {
        ...customPrompts[selectedPrompt],
        prompt: value
      }
    };
    setCustomPrompts(newPrompts);
    setCustomPrompt(value);
    localStorage.setItem(`customPrompts`, JSON.stringify(newPrompts));
  };

  // 修改选择提示词的处理函数
  const handlePromptSelect = (value: string) => {
    setSelectedPrompt(value);
    if (customPrompts[value]) {
      setCustomPrompt(customPrompts[value].prompt);
      localStorage.setItem("selectedPrompt", value); // 保存选中的提示词
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCustomPrompts = JSON.parse(localStorage.getItem(`customPrompts`) || "{}");
      setCustomPrompts(
        Object.keys(storedCustomPrompts).length
          ? storedCustomPrompts
          : {
            "默认提示词": {
              name: "默认提示词",
              prompt: ''
            },
            "I18N插件翻译": {
              name: "I18N插件翻译",
              prompt: defCustomPrompt
            },
          }
      );
    }

  }, []);

  // 初始化时设置选中的提示词
  useEffect(() => {
    if (typeof window !== "undefined" && selectedPrompt) {
      if (customPrompts[selectedPrompt]) {
        setCustomPrompt(customPrompts[selectedPrompt].prompt);
      }
    }
  }, []);

  return (
    <div>
      <Button
        variant="outline"
        className="mt-4 w-full rounded-full shadow-none border-none"
        onClick={() => setShowCustomPrompt(!showCustomPrompt)}
      >
        {showCustomPrompt ? "隐藏自定义提示词" : "显示自定义提示词"}
        <ChevronDown className={`ml-2 h-4 w-4 transform ${showCustomPrompt ? "rotate-180" : ""}`} />
      </Button>

      {showCustomPrompt && (
        <div className="mt-2">
          <Select value={selectedPrompt ?? undefined} onValueChange={handlePromptSelect}>
            <SelectTrigger>
              <SelectValue placeholder="选择提示词" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(customPrompts).map((key) => (
                <SelectItem key={key} value={key}>
                  {customPrompts[key].name}
                  {Object.values(DEFAULT_PROMPTS).includes(key) && " (默认)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedPrompt && (
            <div className="mt-2">
              <textarea
                value={customPrompts[selectedPrompt].prompt}
                style={{ height: '150px' }}
                className="p-2 border rounded bg-gray-100 w-full"
                onChange={(e) => handlePromptChange(e.target.value)}
                placeholder="自定义提示词"
              />
              {/* 只在非默认提示词时显示删除按钮 */}
              {!Object.values(DEFAULT_PROMPTS).includes(selectedPrompt) && (
                <Button variant="outline" className="mt-2 w-full" onClick={handleRemovePrompt}>
                  <Trash className="w-4 h-4 mr-2" /> 删除提示词
                </Button>
              )}
              {/* 添加新的折叠按钮和内容 */}
              <Button
                variant="outline"
                className="mt-2 w-full"
                onClick={() => setShowAddPrompt(!showAddPrompt)} // 需要添加新的state
              >
                <Plus className="w-4 h-4" /> 添加提示词
                <ChevronDown className={` h-4 w-4 transform ${showAddPrompt ? "rotate-180" : ""}`} />
              </Button>

              {/* 添加提示词的折叠内容 */}
              {showAddPrompt && (
                <div className="mt-2 p-4 border rounded">
                  <h3 className="text-lg font-semibold mb-2">添加提示词</h3>
                  <Input
                    value={newPromptName}
                    className="mb-2"
                    onChange={(e) => setNewPromptName(e.target.value)}
                    placeholder="提示词名称"
                  />
                  <textarea
                    value={newPromptContent}
                    style={{ height: '150px' }}
                    className="p-2 border rounded bg-gray-100 w-full mb-2"
                    onChange={(e) => setNewPromptContent(e.target.value)}
                    placeholder="提示词内容"
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleAddPrompt}>
                      添加
                    </Button>
                  </div>
                </div>
              )}


            </div>
          )}
        </div>
      )}

    </div>
  );
}
