
import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Instagram, Twitter, ArrowRight, Trash2, Edit3, 
  Plus, LogOut, ChevronLeft, Briefcase, FileText, CheckCircle2, Clock, Mail, 
  MessageCircle, Facebook, Camera, Eye, Star, ThumbsUp, ShieldCheck, Lock,
  Linkedin, Share2, Globe, Settings, Target, Zap, Shield, Maximize2, Download, Upload, Copy, AlertTriangle,
  Cpu, Activity, Layers, Terminal, Box, Diamond, ZapOff, Filter, Search, Save, PlusCircle, ExternalLink, RefreshCw, Wifi, WifiOff, Database, Key, Code, Rocket,
  Info, TrendingUp, BarChart3, Scan, ShieldAlert, Sparkles, Check, Server
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// Firebase Imports
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc, 
  query, 
  orderBy 
} from "firebase/firestore";
import { 
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged 
} from "firebase/auth";

import { Project, AuthState, Brief, Review, SocialLinks } from './types';
import { INITIAL_PROJECTS } from './constants';

const BRAND_NAME = "MuttaqiLab";

/**
 * --- LABORATORY PROTOCOL: DATABASE CONNECTION ---
 * It is best practice to use Environment Variables (Secrets).
 * Ensure the following keys are set in your environment:
 */
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "", 
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.VITE_FIREBASE_APP_ID || ""
};

// Connection Status Logic
const isConfigured = !!(firebaseConfig.apiKey);
let app: any, db: any, auth: any;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (error) {
    console.error("Firebase Handshake Failed:", error);
  }
}

// --- Hooks ---
const useTitle = (title: string) => {
  useEffect(() => {
    document.title = `${title} | ${BRAND_NAME} | Premium Design Laboratory`;
  }, [title]);
};

// --- Contexts ---
interface AppContextType {
  projects: Project[];
  briefs: Brief[];
  reviews: Review[];
  socials: SocialLinks;
  authState: AuthState;
  login: (e: string, p: string) => Promise<void>;
  logout: () => void;
  isDbActive: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};

// --- Universal UI Components ---
const Button: React.FC<{ 
  variant?: 'primary' | 'outline' | 'ghost' | 'danger', 
  children: React.ReactNode, 
  onClick?: () => void,
  className?: string,
  type?: "button" | "submit",
  disabled?: boolean,
  loading?: boolean
}> = ({ variant = 'primary', children, onClick, className = "", type = "button", disabled = false, loading = false }) => {
  const variants = {
    primary: "bg-[#FF7A00] text-white hover:bg-white hover:text-[#0B0B0B] shadow-lg shadow-[#FF7A00]/20",
    outline: "border border-[#FF7A00] text-[#FF7A00] hover:bg-[#FF7A00] hover:text-white",
    ghost: "text-white hover:text-[#FF7A00]",
    danger: "bg-red-900/20 text-red-500 hover:bg-red-600 hover:text-white border border-red-900/40"
  };

  return (
    <motion.button 
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`px-8 py-3 font-bold uppercase tracking-[0.2em] transition-all duration-500 disabled:opacity-50 premium-radius ${variants[variant]} ${className} text-[10px] md:text-xs flex items-center justify-center`}
    >
      {loading ? <RefreshCw className="animate-spin mr-2" size={14} /> : null}
      {children}
    </motion.button>
  );
};

const StarRating: React.FC<{ rating: number, setRating?: (r: number) => void, interactive?: boolean }> = ({ rating, setRating, interactive = false }) => {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => setRating?.(star)}
          className={`${interactive ? 'cursor-pointer' : 'cursor-default'} transition-all`}
        >
          <Star 
            size={interactive ? 24 : 14} 
            fill={star <= rating ? "#FF7A00" : "transparent"} 
            className={star <= rating ? "text-[#FF7A00]" : "text-zinc-800"} 
          />
        </button>
      ))}
    </div>
  );
};

const DeploymentDiagnosticOverlay = () => {
  if (isConfigured) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[200] max-w-sm">
      <motion.div 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="bg-red-950 border border-red-500 p-6 premium-radius shadow-2xl"
      >
        <div className="flex items-start space-x-4">
          <ShieldAlert className="text-red-500 shrink-0" size={24} />
          <div>
            <h4 className="text-[10px] font-black uppercase text-white mb-2 tracking-widest">Protocol Fail: Config Missing</h4>
            <p className="text-[8px] font-bold text-red-400 uppercase leading-relaxed tracking-wider">
              Laboratory database is offline. Add your Firebase keys to your environment variables (VITE_FIREBASE_API_KEY, etc.) to initialize the system.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Navigation ---
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { authState, logout, isDbActive } = useAppContext();
  const location = useLocation();

  const navLinks = [
    { name: 'Work', path: '/' },
    { name: 'Archive', path: '/projects' },
    { name: 'Reviews', path: '/reviews' },
    { name: 'About', path: '/about' },
    { name: 'Process', path: '/work-with-me' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] bg-[#0B0B0B]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-3 group">
          <span className="text-xl md:text-2xl font-black tracking-tighter text-white uppercase flex items-center">
            MUTTAQI<span className="text-[#FF7A00] italic ml-1">LAB</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center space-x-10">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`text-[9px] font-bold uppercase tracking-[0.4em] transition-all duration-500 hover:text-[#FF7A00] relative group ${location.pathname === link.path ? 'text-[#FF7A00]' : 'text-zinc-500'}`}
            >
              {link.name}
              <span className={`absolute -bottom-1 left-0 h-[1px] bg-[#FF7A00] transition-all duration-500 ${location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </Link>
          ))}
          <Link to="/brief"><Button className="py-2 px-6">Start Brief</Button></Link>
          {authState.isAuthenticated && (
            <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-white/10">
              <Link to="/admin" className="text-[9px] font-black uppercase tracking-widest bg-white text-black px-4 py-1.5 premium-radius hover:bg-[#FF7A00] transition-all">Console</Link>
              <div className={`w-2 h-2 rounded-full ${isDbActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            </div>
          )}
        </div>

        <div className="lg:hidden flex items-center space-x-4">
           <Link to="/brief"><Button className="py-2 px-4 text-[9px]">Start Brief</Button></Link>
           <button className="text-white p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 w-full bg-[#0B0B0B] border-b border-white/10 py-10 lg:hidden shadow-2xl overflow-hidden"
          >
            <div className="flex flex-col items-center space-y-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  onClick={() => setIsOpen(false)}
                  className="text-xl font-black uppercase tracking-[0.2em] text-white hover:text-[#FF7A00]"
                >
                  {link.name}
                </Link>
              ))}
              {authState.isAuthenticated && (
                <>
                  <hr className="w-12 border-white/5" />
                  <Link to="/admin" onClick={() => setIsOpen(false)} className="text-white font-black uppercase tracking-widest">Admin Console</Link>
                  <Button variant="outline" onClick={logout} className="mt-4">Exit Admin</Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.8 }}
    className="pt-24 min-h-screen"
  >
    {children}
  </motion.div>
);

// --- Pages ---
const HomePage = () => {
  useTitle("Home");
  const { projects } = useAppContext();
  const featured = projects.filter(p => p.isFeatured).slice(0, 3);
  return (
    <PageTransition>
      <section className="max-w-7xl mx-auto px-6 mb-32 pt-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl">
           <p className="text-[#FF7A00] font-black uppercase tracking-[0.6em] text-[10px] mb-6">MuttaqiLab Design Ecosystem</p>
           <h1 className="text-6xl md:text-9xl font-black uppercase leading-[0.85] tracking-tighter mb-12 text-white">PRECISION <br /> <span className="text-[#FF7A00] italic">BY DESIGN.</span></h1>
           <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-12 items-baseline">
             <p className="text-xl text-zinc-500 max-w-xl font-light leading-relaxed">Deconstructing brand complexities to build powerful visual protocols. We craft the signals that command industry authority.</p>
             <Link to="/projects"><Button variant="outline">View Archive</Button></Link>
           </div>
        </motion.div>
      </section>
      <section className="max-w-7xl mx-auto px-6 mb-40">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {featured.map((p, idx) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={`group relative overflow-hidden bg-zinc-950 premium-radius ${idx === 2 ? 'md:col-span-2 aspect-[21/9]' : 'aspect-video'}`}>
              <Link to={`/project/${p.id}`} className="block h-full">
                <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-8 left-8">
                  <span className="text-[#FF7A00] text-[8px] font-black uppercase tracking-[0.4em] block mb-2">{p.category}</span>
                  <h3 className="text-3xl font-black uppercase tracking-tighter text-white">{p.title}</h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </PageTransition>
  );
};

const AboutPage = () => {
  useTitle("About Vision");
  const expertise = [
    { title: "Brand Identity", icon: Target, desc: "Building visual systems that command attention and drive recognition." },
    { title: "Creative Strategy", icon: Maximize2, desc: "Deconstructing market noise to find your unique brand authority." },
    { title: "Digital Design", icon: Zap, desc: "Engineering high-performance UI/UX that prioritizes clarity and conversion." },
    { title: "Art Direction", icon: Eye, desc: "Crafting a cohesive visual narrative across every brand touchpoint." }
  ];

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-6 mb-40 pt-16">
        <header className="mb-40">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-[10rem] font-black uppercase mb-16 tracking-tighter leading-[0.85] italic text-white"
          >
            THE <span className="text-[#FF7A00]">VISION.</span> <br /> 
            <span className="md:ml-24">DECONSTRUCTED.</span>
          </motion.h1>
          <p className="text-2xl md:text-5xl text-zinc-500 font-light max-w-5xl leading-tight">
            MuttaqiLab is a sanctuary for <span className="text-white font-bold">Brutalist Precision</span> and strategic visual clarity. We don't just design; we engineer perception.
          </p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-24 mb-60">
          <div className="space-y-12">
            <h2 className="text-sm font-black uppercase tracking-[0.5em] text-[#FF7A00] flex items-center space-x-4">
              <div className="w-8 h-[1px] bg-[#FF7A00]" />
              <span>OUR PHILOSOPHY</span>
            </h2>
            <p className="text-xl md:text-2xl text-zinc-400 font-light leading-relaxed">
              Design is a science of signals. Every line, every shade, and every typographic choice is a data point intended to elicit a specific psychological response. At MuttaqiLab, we focus on the <span className="text-white font-bold">Signal over the Noise</span>.
            </p>
            <p className="text-xl md:text-2xl text-zinc-400 font-light leading-relaxed">
              Our approach is rooted in brutalist honesty—removing the superfluous to expose the core strength of your message.
            </p>
          </div>
          <div className="bg-zinc-950 p-12 premium-radius border border-white/5 flex flex-col justify-center">
            <h3 className="text-3xl font-black uppercase italic mb-8 text-white">ENGINEERING <span className="text-[#FF7A00]">DOMINANCE</span></h3>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] leading-loose">
              01 // DECONSTRUCTION <br />
              02 // CORE IDENTIFICATION <br />
              03 // PRECISION RECONSTRUCTION <br />
              04 // MARKET DEPLOYMENT
            </p>
          </div>
        </section>

        <section className="mb-60">
          <h2 className="text-sm font-black uppercase tracking-[0.5em] text-[#FF7A00] mb-20 text-center">CORE EXPERTISE</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {expertise.map((item, i) => (
              <div key={i} className="bg-zinc-950 border border-white/5 p-10 premium-radius hover:border-[#FF7A00]/40 transition-all group">
                <item.icon size={32} className="text-[#FF7A00] mb-8 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-black uppercase mb-4 text-white">{item.title}</h3>
                <p className="text-zinc-500 text-sm font-light leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

const ProjectsPage = () => {
  useTitle("Archive");
  const { projects } = useAppContext();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const categories = ['All', ...new Set(projects.map(p => p.category))];
  
  const filteredProjects = projects.filter(p => {
    const matchesFilter = filter === 'All' || p.category === filter;
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-6 mb-40 pt-20">
        <div className="flex flex-col lg:flex-row justify-between items-end mb-32 gap-12">
          <h1 className="text-7xl md:text-[12rem] font-black uppercase tracking-tighter italic text-white leading-none">MASTER <br /> <span className="text-[#FF7A00]">WORKS.</span></h1>
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input 
                placeholder="Search Archive..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-950 border border-white/5 p-4 pl-12 focus:border-[#FF7A00] outline-none font-bold premium-radius text-white text-xs uppercase tracking-widest" 
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 text-[8px] font-black uppercase tracking-widest border premium-radius transition-all ${filter === cat ? 'bg-[#FF7A00] border-[#FF7A00] text-white' : 'border-white/5 text-zinc-500 hover:text-white'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          <AnimatePresence>
            {filteredProjects.map(p => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
              >
                <Link to={`/project/${p.id}`} className="group relative block overflow-hidden bg-zinc-950 premium-radius border border-white/5">
                  <img src={p.images[0]} className="w-full aspect-[4/5] object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                  <div className="p-8">
                    <span className="text-[#FF7A00] text-[8px] font-black uppercase tracking-widest">{p.category}</span>
                    <h3 className="text-2xl font-black uppercase mt-2 text-white">{p.title}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
};

const ProjectDetailPage = () => {
  const { id } = useParams();
  const { projects } = useAppContext();
  const project = projects.find(p => p.id === id);
  useTitle(project?.title || "Project Detail");

  if (!project) return <Navigate to="/" />;
  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-6 mb-40 pt-16">
        <Link to="/projects" className="flex items-center space-x-4 text-zinc-600 hover:text-white mb-20 group">
           <ChevronLeft size={20} /><span className="text-[10px] font-black uppercase tracking-widest">Archive</span>
        </Link>
        <header className="mb-24">
          <p className="text-[#FF7A00] font-black uppercase tracking-widest text-xs mb-6">{project.category}</p>
          <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter mb-12 text-white">{project.title}</h1>
          <p className="text-xl md:text-3xl text-zinc-400 font-light max-w-4xl leading-relaxed">{project.description}</p>
        </header>
        <div className="space-y-16">{project.images.map((img, i) => (<img key={i} src={img} className="w-full h-auto premium-radius border border-white/5 grayscale hover:grayscale-0 transition-all duration-1000" />))}</div>
      </div>
    </PageTransition>
  );
};

const ProjectBriefPage = () => {
  useTitle("Start Project");
  const [submitted, setSubmitted] = useState(false);
  const { isDbActive } = useAppContext();
  const [formData, setFormData] = useState({ 
    clientName: '', companyName: '', email: '', projectGoals: '', 
    deliverables: [] as string[], budget: 'Request Quotation', timeline: '1 Month' 
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDbActive) {
      alert("MuttaqiLab: Protocol Error. The laboratory configuration is incomplete.");
      return;
    }
    const newBrief = { ...formData, dateSubmitted: Date.now(), status: 'new' };
    await addDoc(collection(db, "briefs"), newBrief);
    setSubmitted(true);
  };

  if (submitted) return (
    <PageTransition>
      <div className="max-w-2xl mx-auto px-6 text-center py-48">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <CheckCircle2 size={80} className="text-[#FF7A00] mx-auto mb-8" />
          <h1 className="text-5xl font-black uppercase mb-8 italic text-white">MANIFEST RECEIVED.</h1>
          <p className="text-zinc-500 text-lg font-light mb-12">Laboratory analysis initialized. Await transmission sequence.</p>
          <Link to="/"><Button variant="outline">Exit to Home</Button></Link>
        </motion.div>
      </div>
    </PageTransition>
  );

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-6 mb-40 pt-12">
        <header className="mb-20 text-center">
          <h1 className="text-6xl md:text-[8rem] font-black uppercase mb-6 tracking-tighter text-white">PROJECT <span className="text-[#FF7A00]">BRIEF.</span></h1>
          <p className="text-zinc-500 font-bold uppercase tracking-[0.4em] text-[10px]">Initialize the Laboratory Manifest</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-16">
          <section className="space-y-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#FF7A00] border-b border-white/5 pb-4">01 // IDENTITY SEQUENCE</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <input required placeholder="Full Name / Identity" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className="bg-zinc-950 border border-white/5 p-5 focus:border-[#FF7A00] outline-none font-bold premium-radius text-white" />
              <input required placeholder="Company / Entity" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="bg-zinc-950 border border-white/5 p-5 focus:border-[#FF7A00] outline-none font-bold premium-radius text-white" />
              <input required type="email" placeholder="Email Channel" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="md:col-span-2 bg-zinc-950 border border-white/5 p-5 focus:border-[#FF7A00] outline-none font-bold premium-radius text-white" />
            </div>
          </section>

          <section className="space-y-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#FF7A00] border-b border-white/5 pb-4">02 // MISSION GOALS</h2>
            <textarea required rows={6} placeholder="Describe the problem we are solving and the desired end state..." value={formData.projectGoals} onChange={e => setFormData({...formData, projectGoals: e.target.value})} className="w-full bg-zinc-950 border border-white/5 p-8 focus:border-[#FF7A00] outline-none resize-none font-bold premium-radius text-white" />
          </section>

          <Button type="submit" className="w-full py-8 text-lg">Transmit Manifest to Laboratory</Button>
        </form>
      </div>
    </PageTransition>
  );
};

const IntelligenceTerminal = ({ brief, onClose }: { brief: Brief, onClose: () => void }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState(0);

  const scanProtocols = [
    "Initializing Deep Scan Protocol...",
    "Bypassing Surface-Level Corporate Masks...",
    "Extracting Market Authority Data...",
    "Correlating Identity Signals...",
    "Reconstructing Strategic Manifest..."
  ];

  const runIntelligenceAnalysis = async () => {
    setLoading(true);
    for(let i = 0; i < scanProtocols.length; i++) {
      setScanStep(i);
      await new Promise(r => setTimeout(r, 800));
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Research lead: ${brief.clientName} from ${brief.companyName}. Goals: ${brief.projectGoals}. Provide a brutalist strategic analysis, market positioning, and core brand risks.`,
        config: { tools: [{ googleSearch: {} }] }
      });
      setAnalysis(response.text || "No intelligence recovered.");
      setSources(response.candidates?.[0]?.groundingMetadata?.groundingChunks || []);
    } catch (e) {
      console.error(e);
      setAnalysis("Scan Failed. Secure connection error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { runIntelligenceAnalysis(); }, [brief.id]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[300] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6">
       <div className="max-w-5xl w-full bg-zinc-950 border border-[#FF7A00]/20 premium-radius h-[85vh] flex flex-col overflow-hidden shadow-2xl">
          <header className="p-8 border-b border-white/5 flex justify-between items-center bg-zinc-950/50">
             <div className="flex items-center space-x-4">
               <Scan className="text-[#FF7A00] animate-pulse" size={24} />
               <h2 className="text-xl font-black uppercase tracking-[0.2em] italic text-white">INTELLIGENCE SCAN: {brief.companyName.toUpperCase()}</h2>
             </div>
             <button onClick={onClose}><X size={32} className="text-zinc-700 hover:text-white" /></button>
          </header>
          <div className="flex-grow overflow-y-auto p-12 custom-scrollbar">
             {loading ? (
                <div className="h-full flex flex-col items-center justify-center space-y-12">
                   <Cpu className="text-[#FF7A00] animate-pulse" size={48} />
                   <p className="text-[#FF7A00] font-black uppercase tracking-[0.5em] text-xs">{scanProtocols[scanStep]}</p>
                </div>
             ) : (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
               <div className="text-zinc-400 text-lg whitespace-pre-wrap leading-relaxed font-light">{analysis}</div>
               {sources.length > 0 && (
                 <div className="pt-12 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                   {sources.map((c, i) => (
                     <a key={i} href={c.web?.uri} target="_blank" className="p-4 bg-zinc-900/50 border border-white/5 premium-radius flex justify-between group items-center">
                       <span className="text-[10px] uppercase font-bold text-zinc-500 group-hover:text-white truncate">{c.web?.title}</span>
                       <ExternalLink size={14} className="text-zinc-700 group-hover:text-[#FF7A00]" />
                     </a>
                   ))}
                 </div>
               )}
             </motion.div>)}
          </div>
       </div>
    </motion.div>
  );
};

const ProjectEditor = ({ project, onClose }: { project?: Project, onClose: () => void }) => {
  const [formData, setFormData] = useState<Project>(project || {
    id: '', title: '', category: 'Visual Identity', description: '',
    images: [], isFeatured: false, dateCreated: Date.now()
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setFormData({ ...formData, images: [reader.result as string] }); };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!db) return;
    if (project) await updateDoc(doc(db, "projects", project.id), { ...formData });
    else await addDoc(collection(db, "projects"), { ...formData, dateCreated: Date.now() });
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-zinc-950 border border-white/10 premium-radius p-12">
         <h2 className="text-3xl font-black uppercase italic mb-8">{project ? 'Update Asset' : 'New Asset'}</h2>
         <div className="space-y-6">
            <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Title" className="w-full bg-zinc-900 border border-white/5 p-4 text-white premium-radius" />
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-zinc-900 border border-white/5 p-4 text-white premium-radius">
               <option>Visual Identity</option><option>Event Branding</option><option>Editorial Design</option><option>Digital Interface</option>
            </select>
            <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Description" className="w-full bg-zinc-900 border border-white/5 p-4 text-white premium-radius resize-none" />
            <div className="flex items-center space-x-4">
              <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} className="accent-[#FF7A00]" />
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Feature on Home?</label>
            </div>
            <input type="file" onChange={handleImageUpload} className="text-zinc-600 text-xs" />
            <Button onClick={handleSave} className="w-full">Sync Asset</Button>
            <Button onClick={onClose} variant="ghost" className="w-full">Cancel</Button>
         </div>
      </div>
    </motion.div>
  );
};

const AdminDashboard = () => {
  useTitle("Console");
  const { projects, briefs, reviews, socials, logout, authState, isDbActive } = useAppContext();
  const [activeTab, setActiveTab] = useState<'projects' | 'briefs' | 'reviews' | 'settings'>('projects');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [socialForm, setSocialForm] = useState<SocialLinks>(socials);
  const [intelligenceBrief, setIntelligenceBrief] = useState<Brief | null>(null);

  if (!authState.isAuthenticated) return <Navigate to="/login" />;

  const saveSocials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (db) await setDoc(doc(db, "settings", "socials"), socialForm);
  };

  const deleteProject = async (id: string) => { if (db && confirm("Purge asset?")) await deleteDoc(doc(db, "projects", id)); };
  const updateBriefStatus = async (id: string, status: string) => { if (db) await updateDoc(doc(db, "briefs", id), { status }); };
  const deleteBrief = async (id: string) => { if (db && confirm("Purge brief?")) await deleteDoc(doc(db, "briefs", id)); };
  const updateReviewStatus = async (id: string, status: string) => { if (db) await updateDoc(doc(db, "reviews", id), { status }); };
  const deleteReview = async (id: string) => { if (db && confirm("Purge verdict?")) await deleteDoc(doc(db, "reviews", id)); };

  return (
    <PageTransition>
      {(editingProject || isAddingProject) && <ProjectEditor project={editingProject || undefined} onClose={() => { setEditingProject(null); setIsAddingProject(false); }} />}
      {intelligenceBrief && <IntelligenceTerminal brief={intelligenceBrief} onClose={() => setIntelligenceBrief(null)} />}
      
      <div className="max-w-7xl mx-auto px-6 mb-40 pt-16">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 border-b border-white/5 pb-12 gap-8">
          <div className="flex items-center space-x-6">
            <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter">LAB <span className="text-[#FF7A00]">CONSOLE</span></h1>
            <div className={`flex items-center space-x-2 bg-black px-4 py-1 premium-radius border border-white/5`}>
              <Server size={12} className={isDbActive ? "text-green-500" : "text-red-500"} />
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">
                DB STATUS: <span className={isDbActive ? "text-green-500" : "text-red-500"}>{isDbActive ? 'STABLE' : 'OFFLINE'}</span>
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {['projects', 'briefs', 'reviews', 'settings'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-2 uppercase text-[9px] font-black tracking-widest border premium-radius transition-all ${activeTab === tab ? 'bg-[#FF7A00] border-[#FF7A00] text-white' : 'border-white/10 text-zinc-600'}`}>
                {tab}
              </button>
            ))}
            <button onClick={logout} className="p-2 text-zinc-600 hover:text-red-500 ml-4"><LogOut size={20} /></button>
          </div>
        </header>

        {activeTab === 'projects' && (
          <div>
            <Button onClick={() => setIsAddingProject(true)} variant="outline" className="mb-12">+ New Asset</Button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {projects.map(p => (
                 <div key={p.id} className="bg-zinc-950 border border-white/5 p-6 premium-radius group">
                    <img src={p.images[0]} className="w-full aspect-video object-cover mb-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-start">
                      <div>
                         <h3 className="font-black uppercase text-sm text-white">{p.title}</h3>
                         <p className="text-[8px] font-black uppercase tracking-widest text-[#FF7A00] mt-1">{p.category} {p.isFeatured && '• FEATURED'}</p>
                      </div>
                      <div className="flex gap-2">
                       <button onClick={() => setEditingProject(p)} className="p-2 bg-white text-black premium-radius"><Edit3 size={12}/></button>
                       <button onClick={() => deleteProject(p.id)} className="p-2 bg-red-900/20 text-red-500 premium-radius"><Trash2 size={12}/></button>
                      </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'briefs' && (
          <div className="space-y-4">
            {briefs.map(b => (
              <div key={b.id} className="p-6 bg-zinc-950 border border-white/5 premium-radius flex justify-between items-center group">
                <div><h4 className="font-black uppercase text-white">{b.companyName}</h4><p className="text-[10px] text-zinc-500">{b.email} • {new Date(b.dateSubmitted).toLocaleDateString()}</p></div>
                <div className="flex gap-4">
                   <select value={b.status} onChange={(e) => updateBriefStatus(b.id, e.target.value)} className="bg-zinc-900 text-[10px] uppercase font-black px-4 py-2 premium-radius outline-none text-white border border-white/5">
                     <option value="new">New</option><option value="reviewed">Reviewed</option><option value="archived">Archived</option>
                   </select>
                   <Button onClick={() => setIntelligenceBrief(b)} variant="ghost" className="border border-[#FF7A00]/40 text-[#FF7A00] py-2 px-4 flex items-center">
                     <Cpu size={14} className="mr-2" /> Intel Scan
                   </Button>
                   <button onClick={() => deleteBrief(b.id)} className="text-red-500 p-2"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reviews' && (
           <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.id} className="p-6 bg-zinc-950 border border-white/5 premium-radius flex justify-between items-center">
                  <div>
                    <h4 className="font-black uppercase text-white text-sm">{r.clientName}</h4>
                    <StarRating rating={r.rating} />
                    <p className="text-[10px] text-zinc-500 italic mt-2">"{r.content}"</p>
                  </div>
                  <div className="flex gap-4">
                     <button onClick={() => updateReviewStatus(r.id, r.status === 'approved' ? 'pending' : 'approved')} className={`px-4 py-2 text-[8px] font-black uppercase premium-radius transition-all ${r.status === 'approved' ? 'bg-green-600 text-white' : 'bg-white text-black'}`}>
                       {r.status === 'approved' ? 'Approved' : 'Authorize'}
                     </button>
                     <button onClick={() => deleteReview(r.id)} className="text-red-500 p-2"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
           </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
             <form onSubmit={saveSocials} className="space-y-8">
                <h3 className="text-sm font-black uppercase tracking-[0.5em] text-[#FF7A00]">GLOBAL CHANNELS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[9px] font-black uppercase text-zinc-600 flex items-center"><Mail size={10} className="mr-2"/> Email</label>
                     <input value={socialForm.email} onChange={e => setSocialForm({...socialForm, email: e.target.value})} className="w-full bg-zinc-900 p-4 premium-radius border border-white/5 text-white" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[9px] font-black uppercase text-zinc-600 flex items-center"><Instagram size={10} className="mr-2"/> Instagram URL</label>
                     <input value={socialForm.instagram} onChange={e => setSocialForm({...socialForm, instagram: e.target.value})} className="w-full bg-zinc-900 p-4 premium-radius border border-white/5 text-white" />
                   </div>
                </div>
                <Button type="submit" className="w-full py-6">Sync Channels</Button>
             </form>

             <div className="space-y-8">
               <h3 className="text-sm font-black uppercase tracking-[0.5em] text-[#FF7A00]">ENV MANIFEST</h3>
               <div className="bg-zinc-950 p-8 border border-white/5 premium-radius space-y-4">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed mb-4">The following keys must be set in your Environment Secrets (Secrets/Env Vars tab in your hosting provider):</p>
                  <div className="space-y-2">
                    {[
                      { key: 'VITE_FIREBASE_API_KEY', val: !!firebaseConfig.apiKey, desc: 'Primary Database Key' },
                      { key: 'VITE_FIREBASE_PROJECT_ID', val: !!firebaseConfig.projectId, desc: 'Project Identity' },
                      { key: 'API_KEY', val: !!process.env.API_KEY, desc: 'Intelligence Engine (Gemini)' },
                      { key: 'VITE_FIREBASE_APP_ID', val: !!firebaseConfig.appId, desc: 'App Registration' },
                    ].map(item => (
                      <div key={item.key} className="flex flex-col bg-black/50 p-4 premium-radius border border-white/5 group hover:border-[#FF7A00]/40 transition-all">
                        <div className="flex justify-between items-center mb-1">
                          <code className="text-[10px] text-white font-black">{item.key}</code>
                          <div className={`w-2 h-2 rounded-full ${item.val ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`} />
                        </div>
                        <span className="text-[8px] uppercase tracking-tighter text-zinc-600">{item.desc} — {item.val ? 'SIGNAL DETECTED' : 'AWAITING CONNECTION'}</span>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

const WorkWithMePage = () => {
  useTitle("Process");
  const phases = [
    { title: 'Discovery', icon: Terminal, desc: 'Deep data harvesting and brand deconstruction to identify core objectives.' },
    { title: 'Synthesis', icon: Cpu, desc: 'Extraction of high-value signals and strategic visual mapping.' },
    { title: 'Construction', icon: Activity, desc: 'Precise build of all visual assets and identity protocols.' },
    { title: 'Deployment', icon: Layers, desc: 'Final manifest delivery and market authority establishment.' }
  ];

  const packages = [
    {
      name: "Identity Core",
      features: ["Custom Logotype & Iconset", "Primary Palette Protocol", "Typography Hierarchy", "3D Visualization", "Base Identity Guide"],
      icon: Diamond
    },
    {
      name: "Brand Ecosystem",
      features: ["Full Identity Core", "Social Media Asset Kit", "Stationery Manifest", "Marketing Collateral (3)", "Premium Brand Manual"],
      icon: Box,
      popular: true
    },
    {
      name: "Digital Interface",
      features: ["High-Fidelity Web/App UI", "Component Design System", "Interactive Prototype", "Conversion Strategy", "Asset Handoff Protocol"],
      icon: Zap
    },
    {
      name: "Retainer Lab",
      features: ["Ongoing Visual Direction", "Unlimited Asset Iteration", "Market Dominance Analysis", "Priority Protocol Entry", "Direct Laboratory Access"],
      icon: Shield
    }
  ];

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-6 mb-40 pt-20">
        <header className="text-center mb-32">
          <h1 className="text-6xl md:text-[10rem] font-black uppercase mb-16 tracking-tighter leading-[0.85] text-white">SYSTEMS OF <br /> <span className="text-[#FF7A00] italic">POWER.</span></h1>
          <p className="text-zinc-500 font-bold uppercase tracking-[0.4em] text-[10px]">The MuttaqiLab Engineering Workflow</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-60">
          {phases.map((phase, i) => (
            <div key={i} className="bg-zinc-950 border border-white/5 p-10 premium-radius text-left hover:border-[#FF7A00]/30 transition-all group">
              <phase.icon size={24} className="text-[#FF7A00] mb-8 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-black uppercase mb-4 text-white">{phase.title}</h3>
              <p className="text-zinc-500 text-sm font-light leading-relaxed">{phase.desc}</p>
            </div>
          ))}
        </section>

        <section className="mb-60">
          <header className="text-center mb-24">
            <h2 className="text-sm font-black uppercase tracking-[0.5em] text-[#FF7A00] mb-4">INVESTMENT PROTOCOLS</h2>
            <h3 className="text-4xl md:text-6xl font-black uppercase italic text-white tracking-tighter">THE RATE CARD.</h3>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {packages.map((pkg, i) => (
              <div key={i} className={`relative bg-zinc-950 p-10 premium-radius border ${pkg.popular ? 'border-[#FF7A00]' : 'border-white/5'} flex flex-col justify-between group`}>
                {pkg.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FF7A00] text-black text-[9px] font-black uppercase px-4 py-1.5 premium-radius tracking-[0.2em]">High Authority</span>
                )}
                <div>
                  <pkg.icon size={24} className="text-[#FF7A00] mb-8" />
                  <h4 className="text-2xl font-black uppercase text-white mb-2">{pkg.name}</h4>
                  <ul className="space-y-4 mb-12 mt-10">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-3 text-zinc-500 text-xs font-bold uppercase tracking-wider leading-relaxed">
                        <Check size={14} className="text-[#FF7A00] shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link to="/brief" className="w-full">
                  <Button variant={pkg.popular ? 'primary' : 'outline'} className="w-full py-4 text-[9px]">Initialize Protocol</Button>
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#FF7A00] p-16 premium-radius text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-black text-4xl md:text-6xl font-black uppercase mb-8 tracking-tighter italic">READY TO COMMAND <br /> THE MARKET?</h2>
            <Link to="/brief"><Button variant="primary" className="bg-black text-white hover:bg-white hover:text-black border-none py-6 px-12 text-lg">Initialize Global Brief</Button></Link>
          </div>
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -right-20 -bottom-20 opacity-10 pointer-events-none"
          >
            <Settings size={300} className="text-black" />
          </motion.div>
        </section>
      </div>
    </PageTransition>
  );
};

const ReviewsPage = () => {
  useTitle("Verdicts");
  const { reviews, isDbActive } = useAppContext();
  const [formData, setFormData] = useState({ clientName: '', content: '', rating: 5 });
  const approvedReviews = reviews.filter(r => r.status === 'approved');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDbActive) {
      alert("Submission failed. Cloud configuration missing.");
      return;
    }
    await addDoc(collection(db, "reviews"), { ...formData, date: Date.now(), status: 'pending' });
    alert("Verdict initializing. Awaiting laboratory approval.");
    setFormData({ clientName: '', content: '', rating: 5 });
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-6 mb-40 pt-16">
        <h1 className="text-6xl md:text-[10rem] font-black uppercase mb-12 tracking-tighter text-white italic leading-none">CLIENT <br /> <span className="text-[#FF7A00]">VERDICTS.</span></h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
          <div className="lg:col-span-2 space-y-12">
            {approvedReviews.map(review => (
              <div key={review.id} className="bg-zinc-950/50 p-10 border border-white/5 premium-radius">
                <h4 className="font-black uppercase text-xl mb-1 text-white">{review.clientName}</h4>
                <StarRating rating={review.rating} />
                <p className="text-zinc-400 font-light leading-relaxed italic text-lg mt-4">"{review.content}"</p>
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="bg-zinc-950 p-10 premium-radius border border-white/5 space-y-8">
            <h3 className="text-2xl font-black uppercase italic text-white">Drop a Verdict</h3>
            <input required placeholder="Identity" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className="w-full bg-zinc-900 border border-white/5 p-4 text-white premium-radius outline-none" />
            <div className="flex items-center justify-between p-4 bg-zinc-900 premium-radius">
              <span className="text-[10px] font-black uppercase text-zinc-500">Rating</span>
              <StarRating rating={formData.rating} setRating={(r) => setFormData({...formData, rating: r})} interactive />
            </div>
            <textarea required rows={4} placeholder="Verdict text..." value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full bg-zinc-900 border border-white/5 p-4 text-white premium-radius outline-none" />
            <Button type="submit" className="w-full">Initialize Submission</Button>
          </form>
        </div>
      </div>
    </PageTransition>
  );
};

const ContactPage = () => {
  useTitle("Contact");
  const { socials } = useAppContext();
  
  const contactLinks = [
    { icon: Instagram, url: socials.instagram, name: 'Instagram' },
    { icon: Facebook, url: socials.facebook, name: 'Facebook' },
    { icon: MessageCircle, url: socials.whatsapp, name: 'WhatsApp' },
    { icon: Twitter, url: socials.twitter, name: 'Twitter (X)' },
    { icon: Share2, url: socials.pinterest, name: 'Pinterest' },
    { icon: Globe, url: socials.behance, name: 'Behance' },
    { icon: Linkedin, url: socials.linkedin, name: 'LinkedIn' },
  ];

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-6 mb-40 pt-20">
        <header className="mb-32 text-center md:text-left">
           <h1 className="text-6xl md:text-[11rem] font-black uppercase mb-12 tracking-tighter italic leading-none text-white">SECURE <br /> <span className="text-[#FF7A00]">DOMINANCE.</span></h1>
           <div className="flex flex-col md:flex-row items-center md:items-baseline space-y-6 md:space-y-0 md:space-x-12">
             <a href={`mailto:${socials.email}`} className="text-xl md:text-5xl font-black uppercase hover:text-[#FF7A00] transition-all border-b-8 border-[#FF7A00] pb-4 tracking-tighter text-white">{socials.email}</a>
           </div>
        </header>

        <section>
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700 mb-16 border-b border-white/5 pb-4">SOCIAL PROTOCOLS</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8">
            {contactLinks.map((link, i) => link.url ? (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="p-10 bg-zinc-950 border border-white/5 premium-radius flex flex-col items-center justify-center hover:border-[#FF7A00] transition-all group">
                <link.icon size={32} className="text-zinc-600 group-hover:text-[#FF7A00] transition-colors mb-4" />
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-700 group-hover:text-white">{link.name}</span>
              </a>
            ) : null)}
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

const LoginPage = () => {
  useTitle("Authorize Portal");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isDbActive } = useAppContext();
  const navigate = useNavigate();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      alert("Portal Denied. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="max-md mx-auto px-6 py-32 max-w-md">
        <h1 className="text-4xl font-black uppercase tracking-tighter italic mb-12 text-center text-white">GATE <span className="text-[#FF7A00]">SECURITY</span></h1>
        <form onSubmit={handleLogin} className="space-y-8">
          <input type="email" placeholder="Email Channel" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-zinc-950 border border-white/5 p-5 outline-none focus:border-[#FF7A00] font-bold premium-radius text-white" />
          <input type="password" placeholder="Key Sequence" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-zinc-950 border border-white/5 p-5 outline-none focus:border-[#FF7A00] font-bold premium-radius text-white" />
          <Button type="submit" loading={loading} disabled={!isDbActive} className="w-full py-6">Authorize Entry</Button>
        </form>
      </div>
    </PageTransition>
  );
};

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [reviews, setReviews] = useState<Review[]>([
    { id: 'initial-1', clientName: 'Aura Skincare', content: 'Brutal precision and high-value strategic input. MuttaqiLab is the gold standard.', rating: 5, date: Date.now(), status: 'approved' },
    { id: 'initial-2', clientName: 'Neon Pulse', content: 'The visual signals engineered for our festival command absolute authority.', rating: 5, date: Date.now(), status: 'approved' }
  ]);
  const [socials, setSocials] = useState<SocialLinks>({
    instagram: 'https://instagram.com/muttaqilab',
    facebook: 'https://facebook.com/muttaqilab',
    whatsapp: 'https://wa.me/yournumber',
    twitter: 'https://twitter.com/muttaqilab',
    pinterest: 'https://pinterest.com/muttaqilab',
    behance: 'https://behance.net/muttaqilab',
    linkedin: 'https://linkedin.com/in/muttaqilab',
    email: 'official.muttaqilab@gmail.com'
  });
  const [authState, setAuthState] = useState<AuthState>({ isAuthenticated: false, user: null });

  useEffect(() => {
    if (!db || !auth) return;
    const unsubProjects = onSnapshot(query(collection(db, "projects"), orderBy("dateCreated", "desc")), (snap) => {
      const dbProjects = snap.docs.map(d => ({ id: d.id, ...d.data() } as Project));
      if (dbProjects.length > 0) setProjects(dbProjects);
    });
    const unsubBriefs = onSnapshot(query(collection(db, "briefs"), orderBy("dateSubmitted", "desc")), (snap) => {
      setBriefs(snap.docs.map(d => ({ id: d.id, ...d.data() } as Brief)));
    });
    const unsubReviews = onSnapshot(collection(db, "reviews"), (snap) => {
      const dbReviews = snap.docs.map(d => ({ id: d.id, ...d.data() } as Review));
      if (dbReviews.length > 0) setReviews(dbReviews);
    });
    const unsubSocials = onSnapshot(doc(db, "settings", "socials"), (d) => {
      if (d.exists()) setSocials(d.data() as SocialLinks);
    });
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setAuthState({ isAuthenticated: !!user, user: user ? { email: user.email! } : null });
    });
    return () => { unsubProjects(); unsubBriefs(); unsubReviews(); unsubSocials(); unsubAuth(); };
  }, []);

  const login = async (e: string, p: string) => { if (auth) await signInWithEmailAndPassword(auth, e, p); };
  const logout = () => auth && signOut(auth);

  return (
    <AppContext.Provider value={{ projects, briefs, reviews, socials, authState, login, logout, isDbActive: isConfigured }}>
      {children}
    </AppContext.Provider>
  );
};

const Footer = () => {
  const { socials } = useAppContext();
  return (
    <footer className="bg-[#0B0B0B] border-t border-white/5 pt-24 pb-12 mt-40">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase tracking-tighter text-white">MUTTAQI<span className="text-[#FF7A00] italic">LAB</span></h2>
        <div className="flex space-x-6">
           {socials.email && <a href={`mailto:${socials.email}`} className="text-zinc-600 hover:text-[#FF7A00] transition-colors"><Mail size={20}/></a>}
        </div>
      </div>
    </footer>
  );
};

const App = () => {
  return (
    <AppProvider>
      <HashRouter>
        <div className="bg-[#0B0B0B] text-white selection:bg-[#FF7A00] selection:text-white min-h-screen">
          <Navbar />
          <DeploymentDiagnosticOverlay />
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/project/:id" element={<ProjectDetailPage />} />
              <Route path="/brief" element={<ProjectBriefPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/work-with-me" element={<WorkWithMePage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AnimatePresence>
          <Footer />
        </div>
      </HashRouter>
    </AppProvider>
  );
};

export default App;
