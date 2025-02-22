import { useState, useRef, useEffect } from "react";
import "./App.css";
import sendIcon from "./assets/icons8-email-send-48.png";

function App() {
  // eslint-disable-next-line react/no-unknown-property

  const [prompts, setPrompts] = useState([]);
  const [promptText, setPromptText] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState({});
  const chatContainerRef = useRef(null); // Step 1: Create a ref for the chat container

  const handleSendPrompt = async () => {
    const detector = await self.ai.languageDetector.create();
    if (!promptText.trim()) return;

    let newPrompt = {
      id: prompts.length,
      text: promptText,
      language: "loading",
      summary: "",
      translation: "",
      translateLanguage: null,
    };
    setPromptText("");

    const { detectedLanguage, confidence } = (
      await detector.detect(promptText)
    )[0];

    switch (detectedLanguage) {
      case "en":
        newPrompt.language = "en";
        break;
      case "pt":
        newPrompt.language = "pt";
        break;
      case "es":
        newPrompt.language = "es";
        break;
      case "ru":
        newPrompt.language = "ru";
        break;
      case "tr":
        newPrompt.language = "tr";
        break;
      case "fr":
        newPrompt.language = "fr";
        break;
      default:
        console.warn("Language not supported, defaulting to English");
        newPrompt.language = "English";
    }

    setPrompts([...prompts, newPrompt]);
  };

  const handleSummarize = (promptToSummarize) => {
    setPrompts((prevPrompts) =>
      prevPrompts.map((prompt) =>
        prompt.id === promptToSummarize.id
          ? {
              ...prompt,
              summary: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam impedit quas
    iusto perferendis aut omnis ullam ipsum. Quod sit velit nemo nulla animi
    optio, minus, nisi, ut eum magnam perspiciatis.`,
            }
          : prompt
      )
    );
  };

  const handleTranslate = async (promptToTranslate) => {
    ///////////////////////////////
    console.log(selectedLanguages[promptToTranslate.id], "fix");

    console.log(selectedLanguages);
    // alert(promptToTranslate.language);
    try {
      const translator = await self.ai.translator.create({
        sourceLanguage: promptToTranslate.language,
        targetLanguage: selectedLanguages[promptToTranslate.id],
        monitor(m) {
          m.addEventListener("downloadprogress", (e) => {
            console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
          });
        },
      });

      const { text } = promptToTranslate;
      const translatedResult = await translator.translate(text);
      // alert(translatedResult);

      setPrompts((prevPrompts) =>
        prevPrompts.map((prompt) =>
          prompt.id === promptToTranslate.id
            ? {
                ...prompt,
                translateLanguage: selectedLanguages[prompt.id] || "English", // Step 3: Use selected language when translating
                translation: translatedResult,
              }
            : prompt
        )
      );
    } catch (error) {
      alert(error);
      // setPrompts((prevPrompts) =>
      //   prevPrompts.map((prompt) =>
      //     prompt.id === promptToTranslate.id
      //       ? {
      //           ...prompt,
      //           translateLanguage: "en", // Step 3: Use selected language when translating
      //           translation: error,
      //         }
      //       : prompt
      //   )
      // );
    }
  };

  const handleLanguageChange = (e, promptId) => {
    setSelectedLanguages((prev) => ({ ...prev, [promptId]: e.target.value }));
  };

  useEffect(() => {
    // if (chatContainerRef.current) {
    //   chatContainerRef.current.scrollTop =
    //     chatContainerRef.current.scrollHeight;
    // }
  }, [prompts]);

  return (
    <div className="bg-gray-800 h-screen w-full  text-white flex flex-col">
      <div
        className={`flex-1 overflow-auto md:p-8 p-4 space-y-2 custom-scrollbar  ${
          prompts.length ? "" : "justify-center flex items-center"
        }`}
        ref={chatContainerRef}
      >
        {/* <p>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nemo aut
          aliquam officia rem eligendi, sit provident cum iure ipsa nisi nihil
          corporis quisquam debitis inventore error exercitationem temporibus
          magni reprehenderit.
        </p> */}
        <div className="space-y-10">
          {prompts.length ? (
            prompts.map((prompt) => (
              <div key={prompt.id} className="space-y-8 ">
                <div className="space-y-8 text-right  ml-auto rounded-md md:p-3 p-2 md:max-w-md  w-fit break-words bg-cyan-400/50 backdrop-blur-sm">
                  {/* prompt - message */}
                  <p className="mb-4 text-justify">{prompt.text}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span>{prompt.language}</span>
                    <button
                      className="rounded-full bg-gray-700 px-4 py-2"
                      onClick={() => {
                        handleTranslate(prompt);
                      }}
                    >
                      translate
                    </button>
                    {prompt.text.length > 150 && prompt.language == "en" ? (
                      <button
                        className="rounded-full bg-gray-700 px-4 py-2"
                        onClick={() => {
                          handleSummarize(prompt);
                        }}
                      >
                        summarize
                      </button>
                    ) : (
                      ""
                    )}

                    <select
                      name="language"
                      id="language"
                      className="bg-gray-700 px-4 py-2 rounded-full"
                      value={selectedLanguages[prompt.id] || "English"}
                      onChange={(e) => {
                        handleLanguageChange(e, prompt.id);
                      }}
                    >
                      <option value="en"> English(en)</option>
                      <option value="pt">Portuguese (pt)</option>
                      <option value="es">Spanish (es)</option>
                      <option value="ru">Russian (ru)</option>
                      <option value="tr">Turkish (tr)</option>
                      <option value="fr">French (fr)</option>
                    </select>
                  </div>
                </div>

                {prompt.translation.length || prompt.summary.length ? (
                  <div className="md:w-md w-fit bg-gray-600 space-y-8 rounded-md p-3 mr-auto text-justify">
                    {prompt.translation.length ? (
                      <div className="space-y-4">
                        <h2>
                          {`This is the translated version in ${prompt.translateLanguage}`}
                        </h2>
                        <p> {prompt.translation}</p>
                      </div>
                    ) : (
                      ""
                    )}

                    {prompt.summary.length ? (
                      <div>
                        <h2>{`This is the summary of " ${prompt.text} "`}</h2>
                        <p>{prompt.summary}</p>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                ) : (
                  ""
                )}
              </div>
            ))
          ) : (
            <p className="text-4xl">What do you want to translate ??</p>
          )}
        </div>
      </div>

      <div className="border-t-cyan-500 border-t-4  p-4 flex justify-center items-center md:gap-5 gap-2">
        <div>
          <textarea
            className="border border-white mx-auto md:w-2xl min-w-[280px] resize-none md:rounded-2xl rounded-full md:p-2 p-4 h-[60px] outline-0 overflow-auto  custom-scrollbar "
            name="userinput"
            id="userinput"
            value={promptText}
            onChange={(e) => {
              setPromptText(e.target.value);
            }}
          ></textarea>
        </div>

        <button onClick={handleSendPrompt}>
          <img className="w-8 h-8 rotat" src={sendIcon} alt="" />
        </button>
      </div>
    </div>
  );
}

export default App;
