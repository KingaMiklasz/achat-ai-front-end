import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";

export default function IndexScreen() {
  const [messages, setMessages] = useState([
    { sender: "achatAI", text: "👋 Bonjour ! Je suis AchatAI, ton assistant shopping français. Que cherches-tu aujourd’hui ?" },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = { sender: "user", text: inputText };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setLoading(true);

    try {
      const response = await fetch("https://achat-ai-backend-3.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputText }),
      });

      if (!response.ok) throw new Error("Erreur réseau");

      const data = await response.json();

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          { sender: "achatAI", text: "⚠️ Erreur de communication avec le serveur." },
        ]);
      } else {
        const achatAIMessage = { sender: "achatAI", text: data.response };
        setMessages((prev) => [...prev, achatAIMessage]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "achatAI", text: "❌ Erreur de connexion au backend." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f5f5f5" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* 🟦 En-tête */}
      <View
        style={{
          paddingVertical: 25,
          backgroundColor: "white",
          borderBottomWidth: 1,
          borderBottomColor: "#ddd",
          alignItems: "center",
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 5,
          elevation: 3,
        }}
      >
        <Text style={{ fontSize: 28, color: "black", letterSpacing: 1 }}>
          AchatAI
        </Text>
      </View>

      {/* 💬 Zone de messages */}
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1, padding: 15 }}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {messages.map((msg, index) => (
          <View
            key={index}
            style={{
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              backgroundColor: msg.sender === "user" ? "#007bff" : "#ffffff",
              marginVertical: 6,
              padding: 12,
              borderRadius: 16,
              maxWidth: "80%",
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <Text
              style={{
                color: msg.sender === "user" ? "white" : "black",
                fontSize: 15,
                lineHeight: 20,
              }}
            >
              {msg.text}
            </Text>

            {/* 🖼️ Gestion des images intégrées */}
            {msg.text.includes("https://m.media-amazon.com") && (
              <Image
                source={{ uri: msg.text.match(/https:\/\/m\.media-amazon\.com[^\s)]+/g)?.[0] }}
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: 12,
                  marginTop: 8,
                  alignSelf: "center",
                }}
              />
            )}

            {/* 🔗 Gestion des liens Amazon */}
            {msg.text.includes("https://www.amazon") && (
              <TouchableOpacity
                onPress={() => {
                  const url = msg.text.match(/https:\/\/www\.amazon[^\s)]+/g)?.[0];
                  if (url) Linking.openURL(url);
                }}
              >
                <Text
                  style={{
                    color: "#007bff",
                    textDecorationLine: "underline",
                    marginTop: 8,
                    fontSize: 14,
                  }}
                >
                  🔗 Voir sur Amazon
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {loading && (
          <ActivityIndicator size="small" color="#007bff" style={{ marginTop: 10 }} />
        )}
      </ScrollView>

      {/* 📝 Zone de saisie */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderTopWidth: 1,
          borderColor: "#ddd",
          padding: 10,
          backgroundColor: "white",
        }}
      >
        <TextInput
          style={{
            flex: 1,
            backgroundColor: "#f0f0f0",
            borderRadius: 20,
            paddingHorizontal: 15,
            paddingVertical: 10,
            fontSize: 16,
            color: "#333",
          }}
          placeholder="Écris ton message..."
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity
          onPress={sendMessage}
          style={{
            marginLeft: 10,
            backgroundColor: "#007bff",
            borderRadius: 20,
            paddingVertical: 10,
            paddingHorizontal: 20,
          }}
        >
          <Text style={{ color: "white", fontSize: 16 }}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}