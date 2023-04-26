import Head from "next/head";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { LinkMessage, Message } from "../types";
import { nanoid } from "nanoid";
import {
  IoArrowUndoOutline,
  IoCloseCircleOutline,
  IoCopyOutline,
  IoCreateOutline,
  IoEllipsisHorizontal,
  IoSendSharp,
} from "react-icons/io5";

const storageKey = "cheatGPT-20220401";
const passwordKey = "password-20220401";

function getDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; //月份从0开始计数
  const day = now.getDate();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();

  return `${month}${day}${hour}${minute}${second}`;
}

function Timer(callback, interval) {
  var timerId;

  this.start = function () {
    if (!timerId) {
      timerId = setInterval(callback, interval);
    }
  };

  this.stop = function () {
    clearInterval(timerId);
    timerId = undefined;
  };

  this.isRunning = function () {
    return !!timerId;
  };
}

const timer = new Timer(function () {
  console.log(1);
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth",
  });
}, 500);

function getLinkMessageByKey(LinkMessages: LinkMessage[], key: string) {
  const lastkey = LinkMessages.find((message) => message.key === key);
  return lastkey;
}

function Page() {
  const inputRef = useRef(null);
  const [assiContent, setAssiContent] = useState("");
  const [linkMessages, setLinkMessages] = useState<LinkMessage[]>([]);
  const [editKey, setEditKey] = useState("");

  const [whatISaid, setWhatISaid] = useState("");
  const [isLoading, setIsLoading] = useState<"" | "start" | "done">("");
  const [content, setContent] = useState("");
  const [replayMessage, setReplayMessage] = useState<LinkMessage>();

  function exportUserInfo() {
    const fileData = linkMessages
      .map(({ message }) => {
        return (
          (message.role === "user" ? "Q: " : "") + message.content + "\n\n"
        );
      })
      .join("");
    const blob = new Blob([fileData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "cheatGPT聊天记录-" + getDate() + ".txt";
    link.href = url;
    link.click();
  }

  // 按enter发送
  function handleKeyDown(event) {
    if (event.keyCode === 13) {
      if (whatISaid) {
        onSubmit();
      }
    }
  }

  useEffect(() => {
    setTimeout(() => {
      const localStore = window.localStorage.getItem(storageKey);
      try {
        if (localStore) {
          const localStoreObj = JSON.parse(localStore);
          const filter = localStoreObj.filter((item) => {
            if (
              item.key &&
              Array.isArray(item.link) &&
              item.message.content &&
              item.message.content
            ) {
              return true;
            } else {
              return false;
            }
          });
          setLinkMessages(filter);
        }
      } catch (error) {}
    }, 800);
  }, []);

  useEffect(() => {
    if (linkMessages.length > 0) {
      // 实时存储
      window.localStorage.setItem(storageKey, JSON.stringify(linkMessages));
    }
  }, [linkMessages]);

  // 数据请求结束 推入linkMessages
  useEffect(() => {
    if (isLoading === "done") {
      timer.stop();
      const lastLinkMessage = linkMessages[linkMessages.length - 1];
      setLinkMessages((prev) => [
        ...prev,
        {
          link: [...lastLinkMessage.link, lastLinkMessage.key],
          key: nanoid(),
          message: { role: "assistant", content: assiContent },
        },
      ]);
      setAssiContent("");
    }
  }, [isLoading]);

  useEffect(() => {
    if (content) {
      // 开始滚动
      timer.start();

      // 推入 user
      setLinkMessages((prev) => [
        ...prev,
        {
          link: replayMessage ? [...replayMessage.link, replayMessage.key] : [],
          key: nanoid(),
          message: { role: "user", content },
        },
      ]);

      let messages = [];

      // 如果有回复，组织上下文
      if (replayMessage) {
        const prevMessages = linkMessages
          .filter((LinkMessage) => replayMessage.link.includes(LinkMessage.key))
          .map((item) => item.message);
        messages = [...prevMessages, replayMessage.message];
      }

      setIsLoading("start");
      const password = window.localStorage.getItem(passwordKey);

      // 发送请求
      fetch("/api/stream", {
        method: "POST",
        body: JSON.stringify({
          prompt: "你是一个AI助手，你的任务是回答问题并提供帮助",
          messages: [...messages.slice(-4), { role: "user", content }],
          password,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          setContent("");
          setReplayMessage(undefined);
          const decoder = new TextDecoder();
          const reader = response.body.getReader();
          return new ReadableStream({
            start(controller) {
              function push() {
                reader.read().then(({ done, value }) => {
                  if (done) {
                    controller.close();
                    return;
                  }
                  controller.enqueue(decoder.decode(value));
                  push();
                });
              }
              push();
            },
          });
        })
        .then((stream) => {
          const reader = stream.getReader();
          return new Promise((resolve) => {
            function read() {
              reader.read().then(({ done, value }) => {
                if (done) {
                  resolve("");
                  setIsLoading("done");
                  timer.stop();
                  return;
                }
                setAssiContent((prev) => prev + value);
                read();
              });
            }
            read();
          });
        });
    }
  }, [content]);

  const onSubmit = () => {
    if (whatISaid.startsWith("pwd") && whatISaid.length < 20) {
      window.localStorage.setItem(passwordKey, whatISaid);
      setWhatISaid("");
      setAssiContent("密码已设置！");

      setTimeout(() => {
        setAssiContent("");
      }, 2000);
    } else {
      setContent(whatISaid);
      setWhatISaid("");
    }
  };

  return (
    <div>
      <Head>
        <title>{`CheatGPT!`}</title>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=0"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/icon_256x256.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/icon_32x32@2x.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/icon_16x16@2x.png"
        />
        <link rel="icon" href="bitbug_favicon.ico" />
      </Head>
      <div className="mx-auto px-4 py-4 min-h-screen bg-base-200">
        <div className="mx-auto max-w-lg text-center pb-3">
          <h1 className="text-xl font-bold  text-green-400 relative">
            <span className="relative bg-gradient-to-r to-green-400 from-blue-400 text-2xl  mr-[2px] rounded-[9px]  rounded-bl-none  text-white inline-block px-1">
              Ch
              <span className="inline-block  text-yellow-300">e</span>
              at
              <div className=" absolute left-[3px] bottom-0  chat chat-start inline-block p-0 ">
                <div className="chat-bubble min-h-0  p-0 bg-blue-400"></div>
              </div>
            </span>
            GPT!
            <div className="absolute top-0 left-[50%]  text ml-[74px]">
              {isLoading === "start" && "..."}
            </div>
            <button
              className=" absolute top-0 left-0 btn btn-xs btn-outline btn-accent"
              onClick={() => {
                window.localStorage.removeItem(storageKey);
                location.href = window.location.href;
              }}
            >
              清屏
            </button>
            <div className="absolute top-[-5px]   right-[5px] ">
              <button
                className="btn btn-xs btn-outline btn-accent"
                onClick={() => exportUserInfo()}
              >
                💾 导出
              </button>
            </div>
          </h1>

          <div className="pb-12 pt-2">
            {linkMessages.map(({ message, link, key }) => {
              return (
                <div
                  key={key}
                  className={
                    "chat  " +
                    (message.role === "user" ? "chat-end" : "chat-start")
                  }
                >
                  <div
                    id={key}
                    style={{
                      whiteSpace: "break-spaces",
                      wordBreak: "break-word",
                    }}
                    onBlur={() => {
                      const div = document.getElementById(key);
                      div.contentEditable = "false";
                      setLinkMessages((prev) =>
                        prev.map((linkMessage) => {
                          if (linkMessage.key === editKey)
                            linkMessage.message.content = div.innerText;
                          return linkMessage;
                        })
                      );
                      setEditKey("");
                    }}
                    className={
                      "chat-bubble text-gray-700 text-sm text-left box-border " +
                      (message.role === "user"
                        ? " bg-green-300 "
                        : "bg-white ") +
                      (key === editKey ? "border border-yellow-400" : "")
                    }
                  >
                    {message.content}
                  </div>

                  {
                    <div className="chat-footer">
                      <div
                        className={
                          "dropdown dropdown-top " +
                          (message.role === "user" ? " dropdown-end" : "")
                        }
                      >
                        <label
                          tabIndex={0}
                          className="inline-block rounded-full text-xs cursor-pointer opacity-50"
                        >
                          <IoEllipsisHorizontal />
                        </label>
                        <ul
                          tabIndex={0}
                          className="dropdown-content menu menu-compact bg-base-100 text-sm rounded-box  w-[90px]"
                        >
                          <li
                            onClick={() => {
                              setReplayMessage({ message, link, key });
                              inputRef.current.focus();
                            }}
                          >
                            <a className="align-text-bottom ">
                              <IoArrowUndoOutline />
                              <span className=" ml-[-6px] align-sub">回复</span>
                            </a>
                          </li>
                          <li
                            onClick={() => {
                              setEditKey(key);
                              document.getElementById(key).contentEditable =
                                "true";
                              setTimeout(() => {
                                document.getElementById(key).focus();
                              }, 300);
                            }}
                          >
                            <a className="align-text-bottom">
                              <IoCreateOutline className="text" />
                              <span className=" ml-[-6px]">编辑</span>
                            </a>
                          </li>
                          <li
                            onClick={() => {
                              var copyText = document.getElementById(key);
                              var textarea = document.createElement("textarea");
                              textarea.value = copyText.textContent;
                              document.body.appendChild(textarea);
                              textarea.select();
                              document.execCommand("copy");
                              document.body.removeChild(textarea);
                              // alert("复制成功!");
                            }}
                          >
                            <a className="align-text-bottom">
                              <IoCopyOutline />
                              <span className=" ml-[-6px] align-sub">复制</span>
                            </a>
                          </li>
                          <li
                            onClick={() => {
                              setLinkMessages((prev) =>
                                prev.filter((linkMessage) => {
                                  return linkMessage.key !== key;
                                })
                              );
                            }}
                          >
                            <a className="align-text-bottom">
                              <IoCloseCircleOutline />
                              <span className=" ml-[-6px] align-sub">删除</span>
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  }

                  {message.role === "user" &&
                    getLinkMessageByKey(linkMessages, link[link.length - 1]) &&
                    link.length > 0 && (
                      <div className="chat-header text-left  bg-white opacity-50 min-w-[50px] max-w-[150px] truncate text-xs px-2 py-[1px] mt-[1px] rounded-full">
                        <IoArrowUndoOutline className="inline-block mr-1" />
                        {
                          getLinkMessageByKey(
                            linkMessages,
                            link[link.length - 1]
                          ).message.content
                        }
                      </div>
                    )}
                </div>
              );
            })}

            {assiContent && (
              <div className="chat chat-start">
                <div className="chat-bubble bg-white text-gray-700">
                  <div
                    style={{
                      whiteSpace: "break-spaces",
                      wordBreak: "break-word",
                    }}
                    className="text-sm text-left"
                  >
                    {assiContent}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className={
            "fixed bottom-0  w-[100%] left-0 " + (editKey ? "hidden" : "block")
          }
        >
          <div className="mx-auto max-w-lg flex p-4 relative">
            {replayMessage && (
              <div className=" bg-blue-100 text-slate-600 w-[70%]  inline-block absolute top-[-14px] text-xs px-2 py-1 rounded-full pr-[25px]">
                <div className="w-full truncate">
                  {"↗ " + replayMessage.message.content}
                </div>
                <button
                  className="absolute btn-xs right-0 top-0  h-full"
                  onClick={() => {
                    setReplayMessage(undefined);
                    inputRef.current.focus();
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 text-red-400 "
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}
            <input
              ref={inputRef}
              value={whatISaid}
              onKeyDown={handleKeyDown}
              onChange={(e) => setWhatISaid(e.target.value)}
              placeholder="在这里输入你的问题"
              className="input input-sm  w-full  mr-2 input-accent"
            />

            <button
              onClick={onSubmit}
              className="btn btn-sm btn-accent border-none text-slate-600  w-15 text-center"
            >
              发送
              <IoSendSharp className="ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
