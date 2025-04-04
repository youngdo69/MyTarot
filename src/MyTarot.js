import React, { useState } from "react";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { motion } from "framer-motion";

const tarotNames = [
  "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
  "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",
  "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",
  "The Devil", "The Tower", "The Star", "The Moon", "The Sun",
  "Judgement", "The World",
  "Ace of Wands", "Two of Wands", "Three of Wands", "Four of Wands", "Five of Wands",
  "Six of Wands", "Seven of Wands", "Eight of Wands", "Nine of Wands", "Ten of Wands",
  "Page of Wands", "Knight of Wands", "Queen of Wands", "King of Wands",
  "Ace of Cups", "Two of Cups", "Three of Cups", "Four of Cups", "Five of Cups",
  "Six of Cups", "Seven of Cups", "Eight of Cups", "Nine of Cups", "Ten of Cups",
  "Page of Cups", "Knight of Cups", "Queen of Cups", "King of Cups",
  "Ace of Swords", "Two of Swords", "Three of Swords", "Four of Swords", "Five of Swords",
  "Six of Swords", "Seven of Swords", "Eight of Swords", "Nine of Swords", "Ten of Swords",
  "Page of Swords", "Knight of Swords", "Queen of Swords", "King of Swords",
  "Ace of Pentacles", "Two of Pentacles", "Three of Pentacles", "Four of Pentacles", "Five of Pentacles",
  "Six of Pentacles", "Seven of Pentacles", "Eight of Pentacles", "Nine of Pentacles", "Ten of Pentacles",
  "Page of Pentacles", "Knight of Pentacles", "Queen of Pentacles", "King of Pentacles"
];

const tarotDeck = Array.from({ length: 78 }).map((_, i) => ({
  id: `card_${i}`,
  name: tarotNames[i],
  backImage: "/images/cards/tarot-back.png",
  frontImage: `/images/cards/tarot-front-${i + 1}.jpg`
}));

const fetchTarotInterpretation = async (cards, question) => {
  const cardNames = cards.map(c => c.name).join(", ");
  const prompt = `다음은 사용자가 뽑은 타로 카드입니다: ${cardNames}. 이 사람의 질문은: \"${question}\". 이 카드들의 의미를 종합해서 직관적이고 영적인 타로 해석을 해 주세요. 한국어로 답해주세요.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        { role: "system", content: "당신은 신비로운 타로 마스터입니다." },
        { role: "user", content: prompt }
      ],
      temperature: 0.9
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
};

export default function MyTarot() {
  const [selectedCards, setSelectedCards] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [started, setStarted] = useState(false);
  const [questionSubmitted, setQuestionSubmitted] = useState(false);
  const [question, setQuestion] = useState("");
  const [listening, setListening] = useState(false);
  const [gptResponse, setGptResponse] = useState("");
  const maxSelectable = 3;

  const toggleCard = (card) => {
    if (selectedCards.find((c) => c.id === card.id)) {
      setSelectedCards(selectedCards.filter((c) => c.id !== card.id));
    } else if (selectedCards.length < maxSelectable) {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const startVoiceInput = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'ko-KR';
    recognition.start();
    setListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuestion(transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
  };

  const handleSubmitQuestion = () => {
    if (question.trim()) {
      setQuestionSubmitted(true);
      setStarted(true);
    }
  };

  const handleCompleteSelection = async () => {
    if (selectedCards.length === maxSelectable) {
      const interpretation = await fetchTarotInterpretation(selectedCards, question);
      setGptResponse(interpretation);
      setShowResult(true);
    }
  };

  const spreadCount = 3;
  const cardsPerSpread = Math.ceil(tarotDeck.length / spreadCount);
  const spreadChunks = Array.from({ length: spreadCount }, (_, i) =>
    tarotDeck.slice(i * cardsPerSpread, (i + 1) * cardsPerSpread)
  );

  if (!started) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen text-center px-4 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/tarot-intro.mp4" type="video/mp4" />
        </video>
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className="text-4xl font-bold text-white mb-4">마이타로</h1>
            <Button
              onClick={() => setStarted(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg"
            >
              타로 상담 시작하기
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!questionSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-center mb-6">당신의 질문을 들려주세요</h2>
            <div className="space-y-4">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="질문을 입력하세요..."
                className="w-full h-32 p-4 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={startVoiceInput}
                  disabled={listening}
                  className={listening ? "bg-red-500" : "bg-purple-500"}
                >
                  {listening ? "녹음 중..." : "음성으로 질문하기"}
                </Button>
                <Button
                  onClick={handleSubmitQuestion}
                  className="bg-green-500"
                >
                  질문 제출
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900 p-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            {maxSelectable}장의 카드를 선택해주세요
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {tarotDeck.map((card) => (
              <motion.div
                key={card.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleCard(card)}
                className={`relative cursor-pointer ${
                  selectedCards.find((c) => c.id === card.id)
                    ? "z-10"
                    : ""
                }`}
              >
                <img
                  src={
                    selectedCards.find((c) => c.id === card.id)
                      ? card.frontImage
                      : card.backImage
                  }
                  alt={card.name}
                  className="w-full h-auto rounded-lg shadow-lg"
                />
                {selectedCards.find((c) => c.id === card.id) && (
                  <div className="absolute inset-0 border-4 border-purple-500 rounded-lg"></div>
                )}
              </motion.div>
            ))}
          </div>
          {selectedCards.length === maxSelectable && (
            <div className="fixed bottom-8 left-0 right-0 flex justify-center">
              <Button
                onClick={handleCompleteSelection}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4"
              >
                선택 완료
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-center mb-6">타로 해석</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {selectedCards.map((card) => (
                <div key={card.id} className="text-center">
                  <img
                    src={card.frontImage}
                    alt={card.name}
                    className="w-full h-auto rounded-lg shadow-lg mb-2"
                  />
                  <p className="font-semibold">{card.name}</p>
                </div>
              ))}
            </div>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{gptResponse}</p>
            </div>
            <div className="mt-8 flex justify-center">
              <Button
                onClick={() => {
                  setStarted(false);
                  setQuestionSubmitted(false);
                  setShowResult(false);
                  setSelectedCards([]);
                  setQuestion("");
                  setGptResponse("");
                }}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                다시 시작하기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
