import Link from "next/link";

export default function Home() {
  return (
    <main className={`flex  flex-col items-center justify-between p-24`}>
      <Link as={`/chat`} href="/chat">
        <button
          type="button"
          className="mt-2 text-xl font-bold  text-green-400 relative"
        >
          <span className="relative bg-gradient-to-r to-green-400 from-blue-400 text-2xl  mr-[2px] rounded-[9px]  rounded-bl-none  text-white inline-block px-1">
            Ch
            <span className="inline-block  text-yellow-300">e</span>
            at
            <div className=" absolute left-[3px] bottom-0  chat chat-start inline-block p-0 ">
              <div className="chat-bubble min-h-0  p-0 bg-blue-400"></div>
            </div>
          </span>
          GPT!
        </button>
      </Link>

      <div className="h-20"></div>

      <Link as={`/draw`} href="/draw">
        <button
          type="button"
          className="mt-2 text-xl font-bold  text-green-400 relative"
        >
          <span className="relative bg-gradient-to-r to-green-400 from-blue-400 text-2xl  mr-[2px] rounded-[9px]  rounded-bl-none  text-white inline-block px-1">
            Dr
            <span className="inline-block  text-yellow-300">e</span>
            aw
            <div className=" absolute left-[3px] bottom-0  chat chat-start inline-block p-0 ">
              <div className="chat-bubble min-h-0  p-0 bg-blue-400"></div>
            </div>
          </span>
          GPT!
        </button>
      </Link>
    </main>
  );
}

{
}
