import React, { useState } from 'react';
import type { User } from '../types';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../services/firebaseService';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      let user;
      if (isLogin) {
        user = await signInWithEmail(email, password);
      } else {
        user = await signUpWithEmail(email, password, name);
      }
      onLogin(user);
    } catch (err) {
      setError((err as Error).message || 'Authentication failed. Please check your credentials.');
    } finally {
        setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      onLogin(user);
    } catch (err) {
      setError((err as Error).message || 'Google Sign-In failed.');
    } finally {
        setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl animate-fade-in-up">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-white font-display">
            {isLogin ? 'Welcome Back' : 'Join Dynapix'}
          </h2>
          <p className="mt-2 text-md text-gray-400">
            Your journey in AI artistry awaits.
          </p>
        </div>

        <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full inline-flex justify-center items-center py-3 px-4 border border-white/20 rounded-xl shadow-sm bg-white/10 text-md font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-brand-cyan transition-all duration-300 transform hover:scale-105"
        >
            <svg className="w-5 h-5 mr-3" aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 64.5C308.6 102.3 282.7 90 248 90c-82.1 0-148.9 67.2-148.9 149.3s66.8 149.3 148.9 149.3c51.5 0 95.8-25.7 123.4-65.3H248V256h239.8c1.3 7.7 2.2 15.9 2.2 25.8z"></path></svg>
            Continue with Google
        </button>

        <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-xs uppercase">OR</span>
            <div className="flex-grow border-t border-white/10"></div>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
                <div className="relative">
                    <input id="name" name="name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    className="peer h-12 w-full border-b-2 border-gray-500 bg-transparent text-white placeholder-transparent focus:outline-none focus:border-brand-purple" placeholder="Name" />
                    <label htmlFor="name" className="absolute left-0 -top-5 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-5 peer-focus:text-brand-purple peer-focus:text-sm">Name</label>
                </div>
            )}
            <div className="relative">
                <input id="email-address" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="peer h-12 w-full border-b-2 border-gray-500 bg-transparent text-white placeholder-transparent focus:outline-none focus:border-brand-purple" placeholder="Email address" />
                <label htmlFor="email-address" className="absolute left-0 -top-5 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-5 peer-focus:text-brand-purple peer-focus:text-sm">Email address</label>
            </div>
            <div className="relative">
                <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="peer h-12 w-full border-b-2 border-gray-500 bg-transparent text-white placeholder-transparent focus:outline-none focus:border-brand-purple" placeholder="Password" />
                <label htmlFor="password" className="absolute left-0 -top-5 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-5 peer-focus:text-brand-purple peer-focus:text-sm">Password</label>
            </div>
          
            {error && <p className="text-red-400 text-sm text-center animate-pulse">{error}</p>}

            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-brand-purple to-brand-cyan text-white font-bold py-3 px-4 rounded-xl text-lg shadow-lg hover:shadow-glow-purple transition-all duration-300 transform hover:scale-105 active:scale-100 disabled:opacity-60 disabled:scale-100">
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
        </form>

        <p className="text-center text-sm text-gray-400">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); setError('')}} className="font-semibold text-brand-cyan hover:text-cyan-300 ml-2 transition-colors">
            {isLogin ? "Sign Up" : 'Sign In'}
          </a>
        </p>
      </div>
    </div>
  );
};

export default Auth;