import { useEffect, useState } from "react";
import Image from "next/image";
import { IoSendSharp } from "react-icons/io5";

export default function SD() {
  const [artifact, setArtifact] = useState({ prompt: "", base64: "" });
  const [text, setText] = useState("");
  const [cfgScale, setcfgScale] = useState(7);
  const [steps, setSteps] = useState(30);
  const [whatISaid, setWhatISaid] = useState("");
  const [text2, setext2] = useState("");

  useEffect(() => {
    if (text) {
      try {
        const fetchData = async () => {
          // v版本标记
          setext2(`提示语: ${text}, cfgScale:${cfgScale}, steps:${steps}`);
          const response = await fetch(`/api/sd`, {
            method: "POST",
            body: JSON.stringify({ text, cfgScale, steps }),
            headers: {
              "Content-Type": "application/json",
            },
          });

          const json = await response.json();
          if (json && json.artifacts && json.artifacts[0]) {
            setArtifact({ prompt: text, base64: json.artifacts[0].base64 });
          } else {
            window.alert("非法提示语...");
          }
          setText("");
        };
        fetchData();
      } catch (error) {
        console.log(error);
      }
    }

    // 第一次请求
  }, [text]);
  return (
    <div className="mx-auto max-w-lg">
      <div className=" w-full left-0 z-50">
        <h1 className="text-xl px-2 py-1 font-bold text-green-400 mx-auto max-w-lg flex justify-between">
          <div></div>
          <div>
            <span className="relative bg-gradient-to-r to-green-400 from-blue-400 text-2xl  mr-[2px] rounded-[9px]  rounded-bl-none  text-white inline-block px-1">
              dr
              <span className="inline-block  text-yellow-300">e</span>aw
              <div className=" absolute left-[3px] bottom-0  chat chat-start inline-block p-0 ">
                <div className="chat-bubble min-h-0  p-0 bg-blue-400"></div>
              </div>
            </span>
            GPT! <span className="text-xs text-red-400">体验版</span>
          </div>
          <div></div>
        </h1>
      </div>
      {artifact.base64 && (
        <div>
          <Image
            src={"data:image/png;base64," + artifact.base64}
            alt="Picture of the author"
            width={500}
            height={500}
          />
          <div className="text p-2">{text2}</div>
        </div>
      )}

      {text && <div className="text-center mt-4">正在生成中 。。。</div>}

      <div className=" fixed bottom-0 w-full mx-auto  max-w-lg bg-base-100 ">
        <div className="px-4 text-xs">
          1. 最好使用英文输入提示语,越详细越好，当然中文也是可以
          <br />
          2.CfgScale，扩散参数，值越高、越抽象，推荐4-14
          <br />
          3.step，扩散步骤，值越高效果越明显，推荐30-50 <span> </span>
          <button
            className="btn btn-xs btn-primary"
            onClick={() =>
              setText(
                "beautiful detailed eyes highly detailedskinextremely delicate and beautiful girl"
              )
            }
          >
            查看示例
          </button>
        </div>
        <div className=" p-4 pt-2 mx-auto max-w-lg ">
          <textarea
            value={whatISaid}
            onChange={(e) => setWhatISaid(e.target.value)}
            placeholder="输入你的提示语如："
            className="textarea textarea-primary textarea- w-full text-h"
          ></textarea>

          <div className="flex">
            <div className="flex-1  text-xs">
              <div className="flex p-1">
                CfgScale({cfgScale})：
                <input
                  type="range"
                  min="1"
                  max="35"
                  value={cfgScale}
                  onChange={(e) => {
                    setcfgScale(parseInt(e.target.value));
                  }}
                  className="range range-primary range-xs"
                />
              </div>
              <div className="flex p-1">
                Step({steps})：
                <input
                  type="range"
                  min="10"
                  max="150"
                  value={steps}
                  onChange={(e) => {
                    setSteps(parseInt(e.target.value));
                  }}
                  className="range range-xs range-secondary"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setText(whatISaid);
                setWhatISaid("");
              }}
              className="btn  btn-accent border-none text-slate-600  w-15 text-center"
            >
              生成
              <IoSendSharp className="ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
