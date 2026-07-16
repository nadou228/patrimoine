import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { resolveApiUrl } from '../api/config';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Globe,
  Lock,
  LogIn,
  ShieldCheck,
  User,
  ChevronDown,
  Landmark,
  BarChart3,
  Eye,
  EyeOff,
} from 'lucide-react';
import axios from 'axios';
import './LoginPage.css';

type Step = 'credentials' | 'twofa';

const LoginPage: React.FC = () => {
  const [step, setStep] = useState<Step>('credentials');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [totpCode, setTotpCode] = useState(['', '', '', '', '', '']);
  const [tempToken, setTempToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...totpCode];
    next[index] = value.slice(-1);
    setTotpCode(next);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (next.every(digit => digit !== '') && value) {
      handleVerify2FA(next.join(''));
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !totpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify2FA = async (code?: string) => {
    const finalCode = code ?? totpCode.join('');
    if (finalCode.length !== 6) {
      setError('Entrez les 6 chiffres du code.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(
    resolveApiUrl('/api/auth/2fa/verify'),
        { code: parseInt(finalCode, 10) },
        { headers: { Authorization: `Bearer ${tempToken}` } }
      );
      localStorage.setItem(
  'token',
  res.data.token
);

    localStorage.setItem(
      'currentUser',
      JSON.stringify(res.data)
    );
      navigate('/biens');
    } catch {
      setError("Code invalide. Vérifiez votre application d'authentification.");
      setTotpCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  console.log("🟢 Bouton login cliqué");
  console.log("username :", username);
  console.log("password :", password);

  setError('');
  setLoading(true);

  try {
    const result = await login(username, password);

    console.log("✅ Réponse login :", result);

    if ((result as any)?.requiresTwoFactor) {

    setTempToken((result as any).tempToken);
    setStep('twofa');

  } else {

    // Sauvegarde du token JWT
    localStorage.setItem(
      'token',
      (result as any).token
    );


    // Sauvegarde utilisateur
    localStorage.setItem(
      'currentUser',
      JSON.stringify(result)
    );


    console.log("✅ Token enregistré");
    console.log("🚀 Redirection vers biens");


    navigate('/biens');

  }
  } catch (err) {
    console.error("❌ Erreur login :", err);
    setError('Identifiants incorrects ou serveur injoignable.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="login-alt">
      {/* Sidebar Section - Left Side Marketing */}
      <aside className="login-hero">
        <div className="brand">
          <div className="brand-logo-circle">
            <Building2 size={28} />
          </div>
          <div className="brand-text-container">
            <h1 className="brand-name-main">PATRIMOINE <span>360</span></h1>
            <p className="brand-subtitle">Gestion du Patrimoine</p>
          </div>
        </div>
        
        <div className="hero-panel">
          <h2 className="hero-headline">
            Gérez. Suivez. Valorisez.<br />
            <span>Votre patrimoine, en toute simplicité.</span>
          </h2>
          <div className="hero-divider" />
          <p className="hero-description">
            Une solution complète pour une gestion efficace, transparente et sécurisée de vos biens.
          </p>

          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon-box">
                <Landmark size={22} />
              </div>
              <div className="feature-text">
                <h3 className="feature-title">Gestion centralisée</h3>
                <p className="feature-desc">Regroupez toutes vos informations patrimoniales en un seul endroit.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-box">
                <BarChart3 size={22} />
              </div>
              <div className="feature-text">
                <h3 className="feature-title">Suivi en temps réel</h3>
                <p className="feature-desc">Suivez l'état, la localisation et la valeur de vos biens à tout moment.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-box">
                <ShieldCheck size={22} />
              </div>
              <div className="feature-text">
                <h3 className="feature-title">Sécurité renforcée</h3>
                <p className="feature-desc">Vos données sont protégées avec les plus hauts standards de sécurité.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-footer-copyright">
          © 2024 Patrimoine 360. Tous droits réservés.
        </div>
      </aside>

      {/* Main Form Section - Right Side Form */}
      <main className="login-shell">
        {/* Language selector in top-right */}
        <div className="language-selector">
          <Globe size={16} />
          <span>Français</span>
          <ChevronDown size={14} />
        </div>

        <div className="login-card-frame">
          <div className="login-glass">
            <AnimatePresence mode="wait">
              {step === 'credentials' ? (
                <motion.form 
                  key="credentials"
                  onSubmit={handleLogin}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className="login-header-centered">
                    <div className="lock-icon-circle">
                      <Lock size={28} />
                    </div>
                    <h2>Bienvenue !</h2>
                    <p>Connectez-vous à votre espace de gestion du patrimoine</p>
                  </div>

                  {error && (
                    <div className="error">
                      <AlertCircle size={18} />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="field">
                    <label htmlFor="username">Nom d'utilisateur</label>
                    <div className="input-wrap">
                      <User className="input-icon-left" size={20} />
                      <input 
                        id="username"
                        type="text" 
                        placeholder="Entrez votre nom d'utilisateur"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="password">Mot de passe</label>
                    <div className="input-wrap">
                      <Lock className="input-icon-left" size={20} />
                      <input 
                        id="password"
                        type={showPassword ? 'text' : 'password'} 
                        placeholder="Entrez votre mot de passe"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                      />
                      <button 
                        type="button" 
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="forgot-password-wrap">
                    <a href="#" className="forgot-password-link">Mot de passe oublié ?</a>
                  </div>

                  <div className="remember-me-wrap">
                    <input type="checkbox" id="remember-me" defaultChecked />
                    <label htmlFor="remember-me">
                      <span>Se souvenir de moi</span>
                    </label>
                  </div>

                  <button className="btn-connect" type="submit" disabled={loading}>
                    {loading ? (
                      <span className="loader-dots">Connexion en cours...</span>
                    ) : (
                      <>
                        <LogIn size={20} />
                        <span>Se connecter</span>
                      </>
                    )}
                  </button>

                  <div className="divider-or">ou</div>

                  <button type="button" className="btn-sso-mock">
                    <ShieldCheck size={20} color="#2563eb" />
                    <span>Connexion SSO</span>
                  </button>
                </motion.form>
              ) : (
                <motion.div 
                  key="twofa"
                  className="twofa-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="login-header-centered">
                    <div className="lock-icon-circle">
                      <ShieldCheck size={32} />
                    </div>
                    <h2>Vérification 2FA</h2>
                    <p>Entrez le code de sécurité généré par votre application d'authentification</p>
                  </div>

                  {error && (
                    <div className="error">
                      <AlertCircle size={18} />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="otp-grid">
                    {totpCode.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleCodeKeyDown(index, e)}
                        className={digit ? 'filled' : ''}
                        autoFocus={index === 0}
                        aria-label={`Digit ${index + 1}`}
                      />
                    ))}
                  </div>

                  <button 
                    className="btn-connect" 
                    onClick={() => handleVerify2FA()}
                    disabled={loading || totpCode.some(d => !d)}
                  >
                    {loading ? 'Vérification...' : 'Vérifier le code'}
                  </button>

                  <button className="btn-sso-mock" onClick={() => setStep('credentials')} style={{ marginTop: '16px' }}>
                    <ArrowLeft size={16} />
                    <span>Retour à la connexion</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
