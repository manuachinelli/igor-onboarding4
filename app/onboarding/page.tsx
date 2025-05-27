'use client'

import { useEffect, useRef, useState } from 'react'
import styles from '../onboarding.module.css'

interface Message {
  sender: 'user' | 'assistant'
  text: string
}

export default function OnboardingPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [waiting, setWaiting] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowChat(true)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return

    const newMessages = [...messages, { sender: 'user', text: input }]
    setMessages(newMessages)
    setInput('')
    setWaiting(true)

    try {
      const res = await fetch(
        'https://manuachinelli.app.n8n.cloud/webhook/870ab9d1-e23c-4e6e-8630-6fb0c2506f68',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: input }),
        }
      )

      const data = await res.json()

      setMessages([...newMessages, { sender: 'assistant', text: data.reply }])
    } catch (err) {
      setMessages([
        ...newMessages,
        { sender: 'assistant', text: 'Hubo un error al hablar con Igor.' },
      ])
    } finally {
      setWaiting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !waiting) sendMessage()
  }

  if (!showChat) {
    return <div style={{ backgroundColor: '#000', height: '100vh' }} />
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messagesContainer}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`${styles.messageBubble} ${msg.sender === 'user' ? styles.userBubble : styles.assistantBubble}`}
          >
            {msg.text}
          </div>
        ))}

        {waiting && (
          <div className={styles.waiting}>Igor está respondiendo...</div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputSection}>
        <div className={styles.inputBox}>
          <input
            className={styles.input}
            placeholder="Escribí tu mensaje..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={waiting}
          />
          <button
            onClick={sendMessage}
            className={`${styles.iconButton} ${waiting ? styles.disabled : ''}`}
            disabled={waiting}
