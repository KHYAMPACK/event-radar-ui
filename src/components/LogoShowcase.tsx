import { EventRadarLogo } from './EventRadarLogo';

export function LogoShowcase() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-12">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-white text-3xl mb-2">Event Radar Logo</h1>
          <p className="text-gray-400">Satellite dish with signal waves for event discovery</p>
        </div>

        {/* Main showcase */}
        <div className="bg-dark-800 rounded-3xl p-12 border border-white/5 flex items-center justify-center">
          <EventRadarLogo size={200} />
        </div>

        {/* Size variations */}
        <div>
          <h2 className="text-white text-xl mb-6 text-center">Size Variations</h2>
          <div className="bg-dark-800 rounded-3xl p-8 border border-white/5">
            <div className="flex items-center justify-around gap-8">
              <div className="flex flex-col items-center gap-3">
                <EventRadarLogo size={96} />
                <span className="text-gray-500 text-sm">96px</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <EventRadarLogo size={64} />
                <span className="text-gray-500 text-sm">64px</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <EventRadarLogo size={48} />
                <span className="text-gray-500 text-sm">48px</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <EventRadarLogo size={32} />
                <span className="text-gray-500 text-sm">32px</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <EventRadarLogo size={24} />
                <span className="text-gray-500 text-sm">24px</span>
              </div>
            </div>
          </div>
        </div>

        {/* Design details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-dark-800 rounded-2xl p-6 border border-white/5">
            <h3 className="text-white mb-2">Design Elements</h3>
            <ul className="text-gray-400 text-sm space-y-2">
              <li>• Parabolic satellite dish</li>
              <li>• Tripod stand with base</li>
              <li>• Three signal wave arcs</li>
              <li>• Central pivot point</li>
            </ul>
          </div>
          
          <div className="bg-dark-800 rounded-2xl p-6 border border-white/5">
            <h3 className="text-white mb-2">Color Palette</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-[#3A82F7]" />
                <span className="text-gray-400 text-sm">Neon Blue #3A82F7</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-[#4DFFF3]" />
                <span className="text-gray-400 text-sm">Cyan #4DFFF3</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-[#A05BFF]" />
                <span className="text-gray-400 text-sm">Purple #A05BFF</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}