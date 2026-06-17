// src/pages/Certificate.jsx
import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

export default function Certificate() {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canvasRef = useRef(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await axios.get(`/api/results/${resultId}`);
        setResult(res.data);
        setEligible(res.data.score >= 60);
      } catch (err) {
        console.error('Result fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [resultId]);

  useEffect(() => {
    if (!result || !eligible || !canvasRef.current) return;
    drawCertificate();
  }, [result, eligible]);

  const drawCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.5, '#1e1b4b');
    bgGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Outer border glow
    ctx.strokeStyle = 'rgba(99,102,241,0.5)';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, W - 40, H - 40);

    // Inner border
    ctx.strokeStyle = 'rgba(167,139,250,0.3)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(35, 35, W - 70, H - 70);

    // Corner decorations
    const drawCorner = (x, y, rx, ry) => {
      ctx.beginPath();
      ctx.moveTo(x, y + ry);
      ctx.lineTo(x, y);
      ctx.lineTo(x + rx, y);
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 3;
      ctx.stroke();
    };
    drawCorner(35, 35, 40, 40);
    drawCorner(W - 35, 35, -40, 40);
    drawCorner(35, H - 35, 40, -40);
    drawCorner(W - 35, H - 35, -40, -40);

    // Logo / icon area
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#a5b4fc';
    ctx.fillText('⚡', W / 2, 110);

    // Platform name
    ctx.font = 'bold 22px Arial';
    ctx.fillStyle = '#818cf8';
    ctx.fillText('PrepForce AI', W / 2, 145);

    // Subtitle
    ctx.font = '13px Arial';
    ctx.fillStyle = 'rgba(148,163,184,0.8)';
    ctx.fillText('Government & Competitive Exam Preparation Platform', W / 2, 168);

    // Divider line
    const divGrad = ctx.createLinearGradient(W * 0.2, 0, W * 0.8, 0);
    divGrad.addColorStop(0, 'transparent');
    divGrad.addColorStop(0.5, '#6366f1');
    divGrad.addColorStop(1, 'transparent');
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W * 0.2, 185);
    ctx.lineTo(W * 0.8, 185);
    ctx.stroke();

    // Certificate of Achievement
    ctx.font = 'bold 13px Arial';
    ctx.fillStyle = '#94a3b8';
    ctx.letterSpacing = '4px';
    ctx.fillText('CERTIFICATE OF ACHIEVEMENT', W / 2, 220);

    // "This is to certify that"
    ctx.font = '15px Arial';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('This is to certify that', W / 2, 260);

    // Student name
    ctx.font = 'bold 38px Georgia';
    const nameGrad = ctx.createLinearGradient(W * 0.3, 0, W * 0.7, 0);
    nameGrad.addColorStop(0, '#a5b4fc');
    nameGrad.addColorStop(1, '#f9a8d4');
    ctx.fillStyle = nameGrad;
    ctx.fillText(user?.name || result?.studentName || 'Student', W / 2, 315);

    // Underline
    const nameWidth = ctx.measureText(user?.name || 'Student').width;
    ctx.strokeStyle = 'rgba(99,102,241,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2 - nameWidth / 2, 325);
    ctx.lineTo(W / 2 + nameWidth / 2, 325);
    ctx.stroke();

    // Body text
    ctx.font = '15px Arial';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('has successfully completed the mock examination', W / 2, 360);

    // Exam title
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(result?.exam?.title || 'PrepForce Mock Examination', W / 2, 395);

    // Score badge background
    const badgeX = W / 2 - 80;
    const badgeY = 420;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, 160, 50, 25);
    const badgeGrad = ctx.createLinearGradient(badgeX, 0, badgeX + 160, 0);
    badgeGrad.addColorStop(0, '#4f46e5');
    badgeGrad.addColorStop(1, '#7c3aed');
    ctx.fillStyle = badgeGrad;
    ctx.fill();

    // Score text
    ctx.font = 'bold 22px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Score: ${result?.score}%`, W / 2, 452);

    // Date
    ctx.font = '13px Arial';
    ctx.fillStyle = '#64748b';
    ctx.fillText(
      `Issued on: ${new Date(result?.takenAt || Date.now()).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      W / 2,
      500,
    );

    // Divider
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W * 0.2, 520);
    ctx.lineTo(W * 0.8, 520);
    ctx.stroke();

    // Footer
    ctx.font = '11px Arial';
    ctx.fillStyle = '#475569';
    ctx.fillText('PrepForce AI · Pakistan Government & Competitive Exam Preparation', W / 2, 545);
    ctx.fillText('This is an auto-generated certificate for practice purposes.', W / 2, 560);
  };

  const downloadCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `PrepForceAI_Certificate_${user?.name || 'Student'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center text-white space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Loading certificate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-sm text-slate-400 hover:text-indigo-400 transition">
            ← Back
          </button>
          <span className="text-slate-700">|</span>
          <span className="font-extrabold text-xl bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            📜 Certificate
          </span>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm text-slate-400 hover:text-white transition"
        >
          Dashboard →
        </button>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        {!eligible ? (
          /* Not eligible */
          <div className="text-center space-y-6 py-16">
            <div className="text-7xl">😔</div>
            <h2 className="text-3xl font-black">Certificate Not Available</h2>
            <p className="text-slate-400 max-w-md mx-auto">
              You need a score of <strong className="text-amber-400">60% or above</strong> to earn a certificate.
              Your score was <strong className="text-rose-400">{result?.score}%</strong>.
            </p>
            <p className="text-slate-500 text-sm">Keep practicing and try again — you've got this! 💪</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl transition"
              >
                Try Another Test
              </button>
              <button
                onClick={() => navigate('/study-plan')}
                className="px-8 py-3 border border-slate-700 hover:border-slate-500 font-bold rounded-xl transition"
              >
                Get Study Plan
              </button>
            </div>
          </div>
        ) : (
          /* Certificate view */
          <>
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black">🎉 Congratulations!</h2>
              <p className="text-slate-400">
                You scored <strong className="text-indigo-400">{result?.score}%</strong> — your certificate is ready!
              </p>
            </div>

            {/* Canvas Certificate */}
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-indigo-900/40 border border-slate-800">
              <canvas ref={canvasRef} width={800} height={590} className="w-full h-auto" />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={downloadCertificate}
                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-bold rounded-xl shadow-lg shadow-indigo-900/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                ⬇️ Download Certificate (PNG)
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 border border-slate-700 hover:border-slate-500 bg-slate-900 hover:bg-slate-800 font-bold rounded-xl transition"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => navigate('/leaderboard')}
                className="px-8 py-4 border border-slate-700 hover:border-slate-500 bg-slate-900 hover:bg-slate-800 font-bold rounded-xl transition"
              >
                🏆 Leaderboard
              </button>
            </div>

            {/* Share note */}
            <p className="text-center text-slate-600 text-xs">
              📸 You can screenshot or download the certificate above and share it!
            </p>
          </>
        )}
      </main>
    </div>
  );
}
