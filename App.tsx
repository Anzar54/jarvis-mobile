import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Voice, {
  SpeechErrorEvent,
  SpeechResultsEvent,
} from '@react-native-voice/voice';

type Message = { id: string; role: 'user' | 'jarvis'; text: string };

const DESKTOP_URL = ''; // Optional: http://YOUR-LAPTOP-IP:8000/ask

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'jarvis', text: 'Hello. I am Jarvis. How can I help?' },
  ]);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Voice.onSpeechResults = (event: SpeechResultsEvent) => {
      const spoken = event.value?.[0] ?? '';
      setInput(spoken);
      setListening(false);
    };
    Voice.onSpeechError = (_event: SpeechErrorEvent) => setListening(false);
    Voice.onSpeechEnd = () => setListening(false);
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const toggleListening = async () => {
    if (listening) {
      await Voice.stop();
      setListening(false);
      return;
    }
    try {
      setListening(true);
      await Voice.start('en-US');
    } catch {
      setListening(false);
      addMessage('jarvis', 'I could not access speech recognition. Check microphone permission.');
    }
  };

  const addMessage = (role: Message['role'], text: string) => {
    setMessages((current) => [...current, { id: `${Date.now()}-${Math.random()}`, role, text }]);
  };

  const send = async () => {
    const prompt = input.trim();
    if (!prompt || busy) return;
    setInput('');
    addMessage('user', prompt);
    setBusy(true);
    try {
      let reply = localReply(prompt);
      if (DESKTOP_URL) {
        const response = await fetch(DESKTOP_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });
        const data = await response.json();
        reply = data.response ?? data.reply ?? reply;
      }
      addMessage('jarvis', reply);
    } catch {
      addMessage('jarvis', 'I could not reach the desktop assistant. Check the connection settings.');
    } finally {
      setBusy(false);
    }
  };

  const localReply = (prompt: string) => {
    const lower = prompt.toLowerCase();
    if (lower.includes('hello') || lower.includes('hi')) return 'Hello! I am ready.';
    if (lower.includes('time')) return `The time is ${new Date().toLocaleTimeString()}.`;
    if (lower.includes('date')) return `Today is ${new Date().toLocaleDateString()}.`;
    return 'I received your command. Connect me to your Windows Jarvis server for full AI responses.';
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <View><Text style={styles.title}>JARVIS</Text><Text style={styles.subtitle}>ANDROID ASSISTANT</Text></View>
          <View style={[styles.dot, listening && styles.dotActive]} />
        </View>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messages}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.jarvisBubble]}>
              <Text style={styles.role}>{item.role === 'user' ? 'YOU' : 'JARVIS'}</Text>
              <Text style={styles.message}>{item.text}</Text>
            </View>
          )}
        />
        <View style={styles.controls}>
          <Pressable onPress={toggleListening} style={[styles.mic, listening && styles.micActive]} accessibilityLabel="Voice input">
            <Text style={styles.micText}>{listening ? '■' : '🎙'}</Text>
          </Pressable>
          <TextInput
            value={input}
            onChangeText={setInput}
            onSubmitEditing={send}
            placeholder="Ask Jarvis..."
            placeholderTextColor="#78909c"
            style={styles.input}
            returnKeyType="send"
          />
          <Pressable onPress={send} style={styles.send} disabled={busy}>
            {busy ? <ActivityIndicator color="#071017" /> : <Text style={styles.sendText}>➤</Text>}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#071017' },
  container: { flex: 1, paddingHorizontal: 18 },
  header: { height: 88, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#163440' },
  title: { color: '#6fffe9', fontSize: 28, fontWeight: '800', letterSpacing: 5 },
  subtitle: { color: '#78909c', fontSize: 10, letterSpacing: 2, marginTop: 3 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#455a64' },
  dotActive: { backgroundColor: '#6fffe9', shadowColor: '#6fffe9', shadowRadius: 10, shadowOpacity: 1 },
  messages: { paddingVertical: 18, gap: 12 },
  bubble: { padding: 14, borderRadius: 14, maxWidth: '88%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#124d59' },
  jarvisBubble: { alignSelf: 'flex-start', backgroundColor: '#10232c', borderWidth: 1, borderColor: '#1b4652' },
  role: { color: '#6fffe9', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 5 },
  message: { color: '#e5f6f5', fontSize: 16, lineHeight: 23 },
  controls: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 8 },
  mic: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#12333d', alignItems: 'center', justifyContent: 'center' },
  micActive: { backgroundColor: '#6fffe9' },
  micText: { fontSize: 20 },
  input: { flex: 1, height: 48, borderRadius: 24, paddingHorizontal: 17, color: '#fff', backgroundColor: '#10232c', fontSize: 16 },
  send: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#6fffe9', alignItems: 'center', justifyContent: 'center' },
  sendText: { color: '#071017', fontSize: 24, fontWeight: '800' },
});
