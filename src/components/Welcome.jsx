export default function Welcome({ onGetStarted }) {
  return (
    <div className="max-w-2xl mx-auto p-6 pb-20">
      <div className="text-center mb-8 animate-slide-up">
        <div className="text-6xl mb-4">💌</div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent mb-3">
          welcome to luv-letter
        </h1>
        <p className="text-gray-600 text-lg">
          decentralized social media, but actually good
        </p>
      </div>

      <div className="space-y-4 mb-8">
        <div className="card bg-gradient-to-br from-purple-50 to-rose-50 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="font-bold text-gray-900 mb-2">the idea</h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            once a month, send an email to your friends letting them know what events
            you're planning on going to. they can join if they want to. no rsvp or anything.
          </p>
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-rose-50 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="font-bold text-gray-900 mb-2">how it works</h2>
          <div className="text-gray-700 text-sm space-y-2">
            <p>→ add events you're going to this month</p>
            <p>→ add friends who want updates</p>
            <p>→ tap send - opens your email app</p>
            <p>→ hit send, done</p>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-rose-50 to-purple-50 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="font-bold text-gray-900 mb-2">the tech side</h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            completely decentralized. no data captured, no server, no tracking.
            everything stays in your browser. dead simple.
          </p>
        </div>
      </div>

      <button
        onClick={onGetStarted}
        className="btn-primary w-full text-lg animate-slide-up"
        style={{ animationDelay: '0.4s' }}
      >
        get started
      </button>

      <p className="text-center text-xs text-gray-400 mt-6">
        no group chat chaos • no planning burden • no fomo
      </p>
    </div>
  );
}
