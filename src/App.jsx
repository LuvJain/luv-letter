import { useState, useEffect } from 'react'
import Events from './components/Events'
import Subscribers from './components/Subscribers'
import Newsletter from './components/Newsletter'
import Welcome from './components/Welcome'
import AuthLayout from './components/auth-layout'
import { useAuth } from './hooks/use-auth'
import { getEvents, getSubscribers } from './utils/storage'

function App() {
  const auth = useAuth()
  const [currentTab, setCurrentTab] = useState('events')
  const [showSubscribeModal, setShowSubscribeModal] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [subscriberContact, setSubscriberContact] = useState('')
  const [subscriberName, setSubscriberName] = useState('')
  const [subscriberType, setSubscriberType] = useState('email')

  useEffect(() => {
    // Check if URL has subscribe parameter
    const params = new URLSearchParams(window.location.search)
    if (params.get('subscribe') === 'true') {
      setShowSubscribeModal(true)
      return
    }

    // Check if first time user (no events and no subscribers)
    const events = getEvents()
    const subscribers = getSubscribers()
    if (events.length === 0 && subscribers.length === 0) {
      setShowWelcome(true)
    }
  }, [])

  const tabs = [
    { id: 'events', label: 'where', icon: '📍' },
    { id: 'subscribers', label: 'friends', icon: '💜' },
    { id: 'newsletter', label: 'send', icon: '✉️' },
  ]

  const renderContent = () => {
    switch (currentTab) {
      case 'events':
        return <Events />
      case 'subscribers':
        return <Subscribers />
      case 'newsletter':
        return <Newsletter />
      default:
        return <Events />
    }
  }

  const handleSubscribe = (e) => {
    e.preventDefault()

    // Get owner email from URL parameter
    const params = new URLSearchParams(window.location.search)
    const ownerEmail = params.get('owner')

    if (!ownerEmail) {
      alert('Invalid subscribe link - missing owner email')
      return
    }

    // Generate mailto link to the owner
    const contactType = subscriberType === 'email' ? 'Email' : 'Phone';
    const mailtoLink = `mailto:${encodeURIComponent(ownerEmail)}?subject=${encodeURIComponent('New Luv-Letter Subscriber!')}&body=${encodeURIComponent(
      `Hey! Someone wants to subscribe to your Luv-Letter:\n\nName: ${subscriberName}\n${contactType}: ${subscriberContact}\n\nAdd them to your friends list!`
    )}`

    window.location.href = mailtoLink

    // Show success message
    alert('Thanks! An email has been drafted. Send it to let them know you want to subscribe')
    setShowSubscribeModal(false)
    setSubscriberContact('')
    setSubscriberName('')
    setSubscriberType('email')
  }

  // If URL has ?subscribe=true, show subscribe modal without requiring auth
  if (showSubscribeModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-rose-50 to-orange-50">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowSubscribeModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>

            <div className="text-center mb-6 animate-slide-up">
              <div className="text-6xl mb-4">💌</div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent mb-2">
                subscribe to updates
              </h2>
              <p className="text-sm text-gray-500">
                get monthly updates about where i'll be
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-500">
                  your name
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={subscriberName}
                  onChange={(e) => setSubscriberName(e.target.value)}
                  placeholder="your name"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-500">
                  how should they reach you? *
                </label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSubscriberType('email')
                      setSubscriberContact('')
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      subscriberType === 'email'
                        ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    📧 Email
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSubscriberType('phone')
                      setSubscriberContact('')
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      subscriberType === 'phone'
                        ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    📱 Phone
                  </button>
                </div>
                <input
                  type={subscriberType === 'email' ? 'email' : 'tel'}
                  className="input-field"
                  value={subscriberContact}
                  onChange={(e) => setSubscriberContact(e.target.value)}
                  placeholder={subscriberType === 'email' ? 'you@example.com' : '+1234567890'}
                  required
                />
              </div>

              <button type="submit" className="btn-primary w-full">
                subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-rose-50 to-orange-50">
        {/* Welcome Screen */}
        {showWelcome && (
          <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-rose-50 to-orange-50 z-50 overflow-auto">
            <Welcome onGetStarted={() => setShowWelcome(false)} />
          </div>
        )}

        {/* Logout Button */}
        <div className="fixed top-4 right-4 z-40">
          <button
            onClick={auth.logout}
            className="bg-white/80 backdrop-blur-sm text-gray-500 hover:text-rose-500 px-3 py-1.5 rounded-xl text-xs font-semibold border border-purple-100 hover:border-rose-200 transition-all duration-200 shadow-sm"
          >
            sign out
          </button>
        </div>

        {/* Main Content */}
        <main className="pb-16">
          {renderContent()}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-purple-100 safe-area-bottom">
          <div className="flex justify-around items-center h-16">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ${
                  currentTab === tab.id
                    ? 'text-orange-500 scale-110'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <span className="text-2xl mb-1">{tab.icon}</span>
                <span className="text-xs font-semibold">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </AuthLayout>
  )
}

export default App
