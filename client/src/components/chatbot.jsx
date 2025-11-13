import { useState, useRef, useEffect } from "react"
import OpenAI from "openai"
import { Button } from "@/components/ui/button"
import { useEnergyClient } from "../useEnergyClient"
import { Send, Loader2, Zap, Database } from "lucide-react" // Icons for better UI

// --- CONFIGURATION ---
const MODEL_NAME = "llama3.2"
const OLLAMA_BASE_URL = "http://localhost:11434/v1" // Uses the Vite Proxy we set up earlier

export function Chatbot() {
  const [showChatbot, setShowChatbot] = useState(false)
  
  // --- AGENT STATE ---
  const { isConnected, tools, executeTool } = useEnergyClient()
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm VoltGuard. I can analyze your energy usage using real-time database tools. How can I help?" }
  ])
  const [isThinking, setIsThinking] = useState(false)
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isThinking])

  // Initialize OpenAI Client
  const llmClient = new OpenAI({
    baseURL: OLLAMA_BASE_URL,
    apiKey: "ollama",
    dangerouslyAllowBrowser: true
  })

  // --- THE CORE AGENTIC LOOP ---
  const handleSend = async () => {
    if (!input.trim()) return
    if (!isConnected) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Error: MCP Server is not connected. Please check your Python backend." }])
      return
    }

    const userQuery = input
    setInput("") // Clear input
    setIsThinking(true)

    // Add User Message to UI
    const newHistory = [...messages, { role: "user", content: userQuery }]
    setMessages(newHistory)

    try {
      // 1. PREPARE TOOLS
      const openAITools = tools.map(tool => ({
        type: "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema
        }
      }))

      const systemPrompt = {
        role: "system",
        content: `You are VoltGuard, an Energy Efficiency Expert Agent. 
        
        RULES:
        1. You have access to a real database via tools. USE THEM.
        2. DO NOT hallucinate data. If asked about specific usage, calls the tools.
        3. Keep answers concise and helpful.
        4. If a tool returns data, synthesize it into a friendly answer.`
      }

      // Prepare message history for the API (System + User Context)
      // We convert UI messages to API messages, filtering out internal states if needed
      const apiMessages = [systemPrompt, ...newHistory.map(m => ({ role: m.role, content: m.content }))]

      // 2. FIRST LLM CALL (Thinking)
      console.log("🤖 Sending query to LLM...")
      const response1 = await llmClient.chat.completions.create({
        model: MODEL_NAME,
        messages: apiMessages,
        tools: openAITools,
        tool_choice: "auto",
      })

      const msg = response1.choices[0].message
      apiMessages.push(msg) // Add thought to history context

      // 3. TOOL EXECUTION PHASE
      if (msg.tool_calls && msg.tool_calls.length > 0) {
        // Show a temporary "Analyzing..." message
        setMessages(prev => [...prev, { role: "system_status", content: `⚙️ Analyzing with ${msg.tool_calls.length} tools...` }])

        for (const toolCall of msg.tool_calls) {
          const fnName = toolCall.function.name
          const fnArgs = JSON.parse(toolCall.function.arguments)
          
          console.log(`⚡ Executing: ${fnName}`)
          const toolResult = await executeTool(fnName, fnArgs)
          
          // Append tool result to the API context
          apiMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: toolResult
          })
        }

        // 4. SECOND LLM CALL (Synthesis)
        console.log("📝 Synthesizing final answer...")
        const response2 = await llmClient.chat.completions.create({
          model: MODEL_NAME,
          messages: apiMessages,
        })

        const finalContent = response2.choices[0].message.content
        
        // Update UI with the Final Answer (removing the "Analyzing" status)
        setMessages(prev => [
          ...prev.filter(m => m.role !== "system_status"), 
          { role: "assistant", content: finalContent }
        ])

      } else {
        // No tools needed (Conversational reply)
        setMessages(prev => [...prev, { role: "assistant", content: msg.content }])
      }

    } catch (error) {
      console.error(error)
      setMessages(prev => [...prev, { role: "assistant", content: "❌ Sorry, I encountered an error connecting to my brain." }])
    } finally {
      setIsThinking(false)
    }
  }

  // Allow "Enter" key to send
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      <Button
        onClick={() => setShowChatbot(!showChatbot)}
        size="icon"
        className={`fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-2xl transition-all duration-300 border-4 ${
          isConnected ? "border-green-500 bg-white hover:bg-gray-50" : "border-red-500 bg-gray-100"
        } flex items-center justify-center z-50`}
      >
        {/* You can replace this img with a Zap icon if the image is missing */}
        <img 
          src="/energy-shield-logo.png" 
          alt="AI" 
          className="w-10 h-10 object-contain" 
          onError={(e) => { e.target.style.display='none'; }} // Fallback if image missing
        />
        <Zap className="w-8 h-8 text-blue-600 absolute" style={{ opacity: isConnected ? 0.2 : 1 }} /> 
      </Button>

      {/* Chat Window */}
      {showChatbot && (
        <div className="fixed bottom-28 right-8 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-slate-900 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-400 animate-pulse" : "bg-red-500"}`} />
              <h3 className="text-white font-bold text-lg">VoltGuard AI</h3>
            </div>
            <button onClick={() => setShowChatbot(false)} className="text-gray-400 hover:text-white transition-colors">
              ✕
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 h-[400px] overflow-y-auto p-4 bg-slate-50 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                
                {/* Message Bubble */}
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                  msg.role === "user" 
                    ? "bg-blue-600 text-white rounded-br-none" 
                    : msg.role === "system_status"
                      ? "bg-yellow-100 text-yellow-800 border border-yellow-200 text-xs italic flex items-center gap-2"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                }`}>
                  {msg.role === "assistant" && <Zap className="w-4 h-4 inline mr-1 text-yellow-500 mb-0.5"/>}
                  {msg.content}
                </div>
              </div>
            ))}
            
            {/* Thinking Indicator */}
            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-none flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-xs text-gray-500 font-medium">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isConnected ? "Ask about energy usage..." : "Connecting to tools..."}
              disabled={!isConnected || isThinking}
              className="flex-1 px-4 py-2 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
            />
            <Button 
              onClick={handleSend} 
              disabled={!isConnected || isThinking || !input.trim()}
              size="icon"
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>

        </div>
      )}
    </>
  )
}