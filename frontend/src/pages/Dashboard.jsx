import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  ShoppingBag, 
  BrainCircuit, 
  LogOut, 
  Settings, 
  Mail, 
  Phone, 
  ShieldCheck,
  MapPin, 
  Clock, 
  Thermometer, 
  Plus, 
  Sparkles,
  Loader2,
  Calendar,
  DollarSign,
  TrendingUp,
  Droplets,
  AlertTriangle,
  X,
  Star,
  MessageCircle,
  Check,
  Trash2,
  ChevronRight
} from "lucide-react";
import { 
  getSession, 
  clearSession, 
  fetchCurrentWeather, 
  fetchCategories, 
  fetchFoodPosts, 
  createFoodPost,
  fetchAIRecommendation,
  simulateIoT,
  fetchAIHistory,
  fetchPostOffers,
  submitOffer,
  acceptOffer,
  rejectOffer,
  withdrawOffer,
  getWhatsAppLink,
  fetchMyPosts,
  fetchMyOffers,
  fetchMyTransactions,
  updateTransactionStatus,
  submitReview,
  cancelPost
} from "../utils/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'marketplace' | 'petani' | 'transaksi' | 'ai'
  
  // Loading & error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Weather States
  const [weather, setWeather] = useState({
    temperature: 28,
    description: "Cerah",
    location: "Nganjuk, Jawa Timur"
  });
  const [time, setTime] = useState("");

  // Marketplace States
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    description: "",
    category_id: "",
    quantity_needed: "",
    unit: "kg",
    budget_min: "",
    budget_max: "",
    location: "",
    deadline: ""
  });

  // Marketplace Sub-states
  const [marketSubTab, setMarketSubTab] = useState("all"); // 'all' | 'mine'
  const [myPosts, setMyPosts] = useState([]);
  const [myOffers, setMyOffers] = useState([]);
  const [myTransactions, setMyTransactions] = useState([]);
  
  // Post Drawer / Offer states
  const [selectedPost, setSelectedPost] = useState(null);
  const [postOffers, setPostOffers] = useState([]);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerPayload, setOfferPayload] = useState({
    item_name: "",
    item_description: "",
    price_per_unit: "",
    quantity_offered: "",
    message: ""
  });
  
  // Review state
  const [selectedTxForReview, setSelectedTxForReview] = useState(null);
  const [reviewPayload, setReviewPayload] = useState({
    rating: 5,
    comment: ""
  });

  // AI Assistant States
  const [aiMode, setAiMode] = useState("recommend"); // 'recommend' | 'result' | 'simulate'
  const [history, setHistory] = useState([]);
  const [recommendationForm, setRecommendationForm] = useState({
    input_mode: "basic",
    komoditas: "Cabai Merah",
    luas_lahan_m2: 1000,
    lokasi: "Nganjuk, Jawa Timur",
    kondisi_saat_ini: "Irigasi manual, tanah kering saat kemarau",
    budget: 5000000
  });
  const [aiResult, setAiResult] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);

  // Authenticate user session
  useEffect(() => {
    const activeSession = getSession();
    if (!activeSession) {
      navigate("/login");
    } else {
      setSession(activeSession);
    }
  }, [navigate]);

  // Live ticking clock for banner
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch dynamic weather based on user location or fallback
  useEffect(() => {
    if (!session) return;
    
    const loadWeather = async () => {
      // Fallback coordinates (Nganjuk, Jawa Timur)
      let lat = -7.6043;
      let lng = 111.9045;
      let locName = "Nganjuk, Jawa Timur";

      // If user profile has coordinates
      if (session.profile.latitude && session.profile.longitude) {
        lat = session.profile.latitude;
        lng = session.profile.longitude;
      }
      
      // Try to get geolocation if allowed
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            try {
              const data = await fetchCurrentWeather(userLat, userLng);
              setWeather({
                temperature: Math.round(data.temperature),
                description: data.description,
                location: "Lokasi Anda saat ini"
              });
            } catch (err) {
              console.error("Error fetching weather with active location:", err);
            }
          },
          async () => {
            // Geolocation blocked or failed, use profile fallback
            try {
              const data = await fetchCurrentWeather(lat, lng);
              setWeather({
                temperature: Math.round(data.temperature),
                description: data.description,
                location: session.profile.location || locName
              });
            } catch (err) {
              console.error("Error fetching weather:", err);
            }
          }
        );
      } else {
        try {
          const data = await fetchCurrentWeather(lat, lng);
          setWeather({
            temperature: Math.round(data.temperature),
            description: data.description,
            location: session.profile.location || locName
          });
        } catch (err) {
          console.error("Error fetching weather:", err);
        }
      }
    };

    loadWeather();
  }, [session]);

  // Load Marketplace & AI data when tab switches or marketplace sub-tab changes
  useEffect(() => {
    if (!session) return;

    if (activeTab === "marketplace") {
      loadMarketplaceData();
    } else if (activeTab === "petani") {
      loadPetaniData();
    } else if (activeTab === "transaksi") {
      loadTransaksiData();
    } else if (activeTab === "ai") {
      loadAIData();
    }
  }, [activeTab, session, marketSubTab]);

  const loadMarketplaceData = async () => {
    setLoading(true);
    try {
      const categoriesData = await fetchCategories();
      setCategories(categoriesData);

      if (marketSubTab === "all") {
        const postsData = await fetchFoodPosts();
        setPosts(postsData);
      } else {
        const myPostsData = await fetchMyPosts(session.token);
        setMyPosts(myPostsData);
      }
    } catch (err) {
      setError("Gagal memuat data marketplace.");
    } finally {
      setLoading(false);
    }
  };

  const loadPetaniData = async () => {
    setLoading(true);
    try {
      const offersData = await fetchMyOffers(session.token);
      setMyOffers(offersData);
    } catch (err) {
      setError("Gagal memuat data penawaran Anda.");
    } finally {
      setLoading(false);
    }
  };

  const loadTransaksiData = async () => {
    setLoading(true);
    try {
      const txData = await fetchMyTransactions(session.token);
      setMyTransactions(txData);
    } catch (err) {
      setError("Gagal memuat data transaksi.");
    } finally {
      setLoading(false);
    }
  };

  const loadAIData = async () => {
    setLoading(true);
    try {
      const historyData = await fetchAIHistory(session.token);
      setHistory(historyData);
    } catch (err) {
      setError("Gagal memuat riwayat rekomendasi AI.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPostDetail = async (post) => {
    setSelectedPost(post);
    setLoading(true);
    setError("");
    try {
      const offers = await fetchPostOffers(post.id, session.token);
      setPostOffers(offers);
    } catch (err) {
      setPostOffers([]);
      console.log("No offers or error fetching offers:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPost = async (postId) => {
    if (!window.confirm("Apakah Anda yakin ingin membatalkan postingan ini?")) return;
    setLoading(true);
    setError("");
    try {
      await cancelPost(postId, session.token);
      setSuccess("Postingan berhasil dibatalkan.");
      setSelectedPost(null);
      loadMarketplaceData();
    } catch (err) {
      setError(err.message || "Gagal membatalkan postingan.");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId) => {
    if (!window.confirm("Apakah Anda yakin ingin menerima penawaran ini?")) return;
    setLoading(true);
    setError("");
    try {
      const res = await acceptOffer(offerId, session.token);
      setSuccess(res.message || "Penawaran berhasil diterima!");
      if (selectedPost) {
        // Fetch updated details
        const updatedPost = await fetchMyPosts(session.token).then(myPostsList => 
          myPostsList.find(p => p.id === selectedPost.id)
        );
        if (updatedPost) {
          handleOpenPostDetail(updatedPost);
        } else {
          setSelectedPost(null);
        }
      }
      loadMarketplaceData();
    } catch (err) {
      setError(err.message || "Gagal menerima penawaran.");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectOffer = async (offerId) => {
    if (!window.confirm("Apakah Anda yakin ingin menolak penawaran ini?")) return;
    setLoading(true);
    setError("");
    try {
      await rejectOffer(offerId, session.token);
      setSuccess("Penawaran ditolak.");
      if (selectedPost) {
        const offers = await fetchPostOffers(selectedPost.id, session.token);
        setPostOffers(offers);
      }
    } catch (err) {
      setError(err.message || "Gagal menolak penawaran.");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppContact = async (offerId) => {
    setError("");
    try {
      const res = await getWhatsAppLink(offerId, session.token);
      if (res.whatsapp_url) {
        window.open(res.whatsapp_url, "_blank");
      } else {
        setError("Link WhatsApp tidak valid.");
      }
    } catch (err) {
      setError(err.message || "Gagal mendapatkan kontak WhatsApp.");
    }
  };

  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    if (!selectedPost) return;
    setLoading(true);
    setError("");
    try {
      await submitOffer(
        selectedPost.id,
        {
          item_name: offerPayload.item_name,
          item_description: offerPayload.item_description,
          price_per_unit: parseFloat(offerPayload.price_per_unit),
          quantity_offered: parseFloat(offerPayload.quantity_offered),
          message: offerPayload.message
        },
        session.token
      );
      setSuccess("Penawaran Anda berhasil dikirim!");
      setShowOfferModal(false);
      setOfferPayload({
        item_name: "",
        item_description: "",
        price_per_unit: "",
        quantity_offered: "",
        message: ""
      });
      handleOpenPostDetail(selectedPost);
    } catch (err) {
      setError(err.message || "Gagal mengirim penawaran.");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawOffer = async (offerId) => {
    if (!window.confirm("Apakah Anda yakin ingin menarik penawaran ini?")) return;
    setLoading(true);
    setError("");
    try {
      await withdrawOffer(offerId, session.token);
      setSuccess("Penawaran berhasil ditarik.");
      if (selectedPost) {
        const offers = await fetchPostOffers(selectedPost.id, session.token);
        setPostOffers(offers);
      }
      if (activeTab === "petani") {
        loadPetaniData();
      }
    } catch (err) {
      setError(err.message || "Gagal menarik penawaran.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTxStatus = async (txId, status) => {
    const statusLabels = {
      confirmed: "mengonfirmasi kesepakatan",
      completed: "menyelesaikan transaksi",
      cancelled: "membatalkan transaksi"
    };
    if (!window.confirm(`Apakah Anda yakin ingin ${statusLabels[status]} ini?`)) return;
    setLoading(true);
    setError("");
    try {
      await updateTransactionStatus(txId, status, session.token);
      setSuccess(`Status transaksi berhasil diubah.`);
      loadTransaksiData();
    } catch (err) {
      setError(err.message || "Gagal mengubah status transaksi.");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTxForReview) return;
    setLoading(true);
    setError("");
    try {
      await submitReview(
        {
          transaction_id: selectedTxForReview.id,
          rating: reviewPayload.rating,
          comment: reviewPayload.comment
        },
        session.token
      );
      setSuccess("Ulasan berhasil dikirim!");
      setSelectedTxForReview(null);
      setReviewPayload({ rating: 5, comment: "" });
      loadTransaksiData();
    } catch (err) {
      setError(err.message || "Gagal mengirim ulasan.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate("/");
  };

  // Create marketplace post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await createFoodPost(
        {
          ...newPost,
          quantity_needed: parseFloat(newPost.quantity_needed),
          budget_min: parseFloat(newPost.budget_min),
          budget_max: parseFloat(newPost.budget_max),
        },
        session.token
      );
      setSuccess("Postingan berhasil dibuat!");
      setShowCreateModal(false);
      // Reset form
      setNewPost({
        title: "",
        description: "",
        category_id: "",
        quantity_needed: "",
        unit: "kg",
        budget_min: "",
        budget_max: "",
        location: "",
        deadline: ""
      });
      loadMarketplaceData();
    } catch (err) {
      setError(err.message || "Gagal membuat postingan.");
    } finally {
      setLoading(false);
    }
  };

  // Generate AI Recommendation
  const handleAIRecommendation = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await fetchAIRecommendation(recommendationForm, session.token);
      setAiResult(data);
      setAiMode("result");
      setSimulationResult(null);
    } catch (err) {
      setError(err.message || "Gagal menghasilkan rekomendasi AI.");
    } finally {
      setLoading(false);
    }
  };

  // Run Digital Twin Simulation
  const handleAISimulation = async (recId) => {
    setLoading(true);
    setError("");
    try {
      const data = await simulateIoT(recId, session.token);
      setSimulationResult(data);
      setAiMode("simulate");
    } catch (err) {
      setError(err.message || "Gagal menjalankan simulasi digital twin.");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#5E8000]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-neutral-50 font-body text-neutral-800">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col justify-between p-6 shrink-0">
        <div className="space-y-8">
          
          {/* Logo / Title */}
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-2xl tracking-tight text-[#5E8000]">
              AGRI<span className="text-[#A1C942]">VO</span>
            </span>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1.5">
            {/* Dashboard header */}
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-400 px-3 mb-3">
              <span>Main Menu</span>
              <Settings className="w-3.5 h-3.5" />
            </div>

            {/* Profile Tab */}
            <button
              onClick={() => { setActiveTab("profile"); setError(""); setSuccess(""); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "profile" 
                  ? "bg-[#A1C942] text-white shadow-sm" 
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4" />
                <span>Profile</span>
              </div>
            </button>

            {/* Marketplace Tab */}
            <button
              onClick={() => { setActiveTab("marketplace"); setError(""); setSuccess(""); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "marketplace" 
                  ? "bg-[#A1C942] text-white shadow-sm" 
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4" />
                <span>Marketplace</span>
              </div>
            </button>

            {/* Petani Tab (role: petani only) */}
            {session.profile.role === "petani" && (
              <button
                onClick={() => { setActiveTab("petani"); setError(""); setSuccess(""); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "petani" 
                    ? "bg-[#A1C942] text-white shadow-sm" 
                    : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4" />
                  <span>Penawaran Saya</span>
                </div>
              </button>
            )}

            {/* Transaksi Tab */}
            <button
              onClick={() => { setActiveTab("transaksi"); setError(""); setSuccess(""); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "transaksi" 
                  ? "bg-[#A1C942] text-white shadow-sm" 
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4" />
                <span>Transaksi</span>
              </div>
            </button>

            {/* AI Assistant Tab */}
            <button
              onClick={() => { setActiveTab("ai"); setAiMode("recommend"); setError(""); setSuccess(""); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "ai" 
                  ? "bg-[#A1C942] text-white shadow-sm" 
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BrainCircuit className="w-4 h-4" />
                <span>AI assistant</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Logout Section */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-neutral-500 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </aside>

      {/* MAIN MAIN PANEL */}
      <main className="flex-1 p-8 overflow-y-auto max-w-5xl mx-auto w-full">
        
        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            
            {/* Header Greeting */}
            <h1 className="text-3xl font-extrabold font-display tracking-tight text-neutral-900 border-b-2 border-[#5E8000]/20 pb-2 w-fit">
              Hallo, {session.profile.full_name?.split(" ")[0]} 👋
            </h1>

            {/* Top Row: User Card & Data grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Profile Card Left */}
              <div className="md:col-span-5 bg-white rounded-3xl border border-neutral-100 shadow-sm p-6 flex flex-col items-center justify-center text-center">
                <div className="relative mb-4">
                  {/* Mock profile image or dynamic avatar */}
                  <img
                    src={session.profile.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"}
                    alt={session.profile.full_name}
                    className="w-32 h-32 rounded-3xl object-cover border-4 border-[#A1C942]/10"
                  />
                  <span className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-[#5E8000] border-2 border-white flex items-center justify-center text-[10px] text-white">✓</span>
                </div>

                <h3 className="text-lg font-bold text-neutral-900">{session.profile.full_name}</h3>
                <p className="text-xs font-semibold text-neutral-400 capitalize mb-4">{session.profile.role}</p>

                <button className="px-5 py-1.5 rounded-full border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-50 active:scale-95 transition-all">
                  Edit
                </button>
              </div>

              {/* Data Lengkap Grid Right */}
              <div className="md:col-span-7 space-y-4">
                <h4 className="text-lg font-bold text-neutral-900 font-display pb-1 border-b border-neutral-200">Data Lengkap</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Nama block */}
                  <div className="p-4 rounded-2xl bg-[#A1C942] text-white">
                    <div className="text-xs font-semibold opacity-75">| Nama</div>
                    <div className="text-base font-bold mt-1 truncate">{session.profile.full_name}</div>
                  </div>

                  {/* Email block */}
                  <div className="p-4 rounded-2xl bg-[#5E8000] text-white">
                    <div className="text-xs font-semibold opacity-75">| Email</div>
                    <div className="text-base font-bold mt-1 truncate">{session.profile.email}</div>
                  </div>

                  {/* Nomor block */}
                  <div className="p-4 rounded-2xl bg-[#5E8000] text-white">
                    <div className="text-xs font-semibold opacity-75">| Nomor</div>
                    <div className="text-base font-bold mt-1 truncate">{session.profile.whatsapp_number || "-"}</div>
                  </div>

                  {/* Status block */}
                  <div className="p-4 rounded-2xl bg-[#A1C942] text-white">
                    <div className="text-xs font-semibold opacity-75">| Status</div>
                    <div className="text-base font-bold mt-1 truncate capitalize">{session.profile.role}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Weather Landscape Banner */}
            <div className="relative rounded-3xl overflow-hidden h-64 shadow-md bg-neutral-900 flex items-end">
              {/* Landscape Background Image */}
              <img
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
                alt="Agriculture"
                className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

              {/* Weather Content Overlay */}
              <div className="relative z-10 p-6 sm:p-8 w-full text-white flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div className="space-y-2">
                  {/* Time display */}
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#A1C942]" />
                    <span className="text-4xl font-extrabold tracking-tight font-display">{time}</span>
                  </div>
                  {/* Location display */}
                  <div className="flex items-center gap-1.5 text-sm font-semibold opacity-90">
                    <MapPin className="w-4 h-4 text-[#FFC000]" />
                    <span>{weather.location}</span>
                  </div>
                </div>

                <div className="flex items-end gap-3.5">
                  {/* Temp display */}
                  <div className="flex items-start">
                    <span className="text-6xl font-black font-display leading-none">{weather.temperature}</span>
                    <span className="text-2xl font-bold">°C</span>
                  </div>
                  
                  {/* Weather Status */}
                  <div className="border-l border-white/20 pl-3.5 py-1">
                    <div className="text-xs font-semibold uppercase tracking-wider text-[#A1C942] flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5" /> Suhu Real-Time
                    </div>
                    <div className="text-sm font-bold opacity-90 mt-0.5">{weather.description}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MARKETPLACE TAB (MARKETPLACE POSTINGS) */}
        {activeTab === "marketplace" && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Header Title with Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 pb-4">
              <div>
                <h1 className="text-2xl font-extrabold font-display">Kebutuhan Pasar & Pangan</h1>
                <p className="text-xs text-neutral-400 mt-1">Daftar permintaan suplai pangan dari konsumen Agrivo</p>
              </div>

              {session.profile.role === "konsumen" && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5E8000] text-white font-bold text-xs hover:bg-[#4d6900] active:scale-95 transition-all shadow-md shadow-[#5E8000]/10 cursor-pointer w-fit"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat Postingan Baru</span>
                </button>
              )}
            </div>

            {/* Sub Tabs Segmented Control (if consumer) */}
            {session.profile.role === "konsumen" && (
              <div className="flex gap-2 p-1 bg-neutral-100 rounded-xl w-fit">
                <button
                  onClick={() => setMarketSubTab("all")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    marketSubTab === "all" ? "bg-white text-[#5E8000] shadow-sm" : "text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  Semua Postingan
                </button>
                <button
                  onClick={() => setMarketSubTab("mine")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    marketSubTab === "mine" ? "bg-white text-[#5E8000] shadow-sm" : "text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  Postingan Saya
                </button>
              </div>
            )}

            {/* Error / Success notifications */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-emerald-700">
                {success}
              </div>
            )}

            {/* Loading state */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#5E8000]" />
              </div>
            ) : (marketSubTab === "all" ? posts : myPosts).length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-neutral-100 shadow-sm p-8">
                <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-neutral-700">Belum ada postingan kebutuhan</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  {session.profile.role === "konsumen" 
                    ? "Mulai buat postingan pertama Anda untuk mencari pasokan bibit/panen." 
                    : "Silakan pantau kembali halaman ini beberapa waktu lagi."}
                </p>
              </div>
            ) : (
              /* Postings List */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(marketSubTab === "all" ? posts : myPosts).map((post) => {
                  const postedAt = post.created_at
                    ? (() => {
                        const diffMs = Date.now() - new Date(post.created_at).getTime();
                        const diffMins = Math.floor(diffMs / 60000);
                        if (diffMins < 60) return `${diffMins} menit yang lalu`;
                        const diffHrs = Math.floor(diffMins / 60);
                        if (diffHrs < 24) return `${diffHrs} jam yang lalu`;
                        return `${Math.floor(diffHrs / 24)} hari yang lalu`;
                      })()
                    : "";

                  const avatarUrl = post.profiles?.avatar_url;
                  const posterName = post.profiles?.full_name || "Anonim";
                  
                  const fulfilledPct = Math.min(
                    100,
                    Math.round(((post.quantity_fulfilled || 0) / post.quantity_needed) * 100)
                  );

                  const statusColors = {
                    open: "bg-blue-50 text-blue-700 border-blue-100",
                    partially_fulfilled: "bg-yellow-50 text-yellow-700 border-yellow-100",
                    closed: "bg-neutral-100 text-neutral-600 border-neutral-200",
                    completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
                    cancelled: "bg-red-50 text-red-700 border-red-100"
                  };

                  return (
                    <div
                      key={post.id}
                      onClick={() => handleOpenPostDetail(post)}
                      className="bg-white rounded-2xl border border-neutral-250 hover:border-[#A1C942] shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between gap-4 cursor-pointer relative"
                    >
                      {/* Top Row: Category & Status */}
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[10px] font-bold">
                          {post.categories?.name || "Lainnya"}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${statusColors[post.status] || "bg-neutral-50"}`}>
                          {post.status?.replace("_", " ")}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="font-bold text-neutral-900 text-base leading-snug line-clamp-1">{post.title}</h3>
                        <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2 mt-1.5">
                          {post.description}
                        </p>
                      </div>

                      {/* Quantity & Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold text-neutral-600">
                          <span>Kebutuhan Terpenuhi:</span>
                          <span className="text-[#5E8000]">
                            {post.quantity_fulfilled || 0} / {post.quantity_needed} {post.unit}
                          </span>
                        </div>
                        <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#5E8000] h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${fulfilledPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Meta Info: Budget, Deadline, Location */}
                      <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-neutral-100 text-xs">
                        <div>
                          <span className="text-neutral-400 font-semibold block text-[10px] uppercase">Budget / Unit</span>
                          <span className="font-bold text-[#5E8000]">
                            Rp {post.budget_min?.toLocaleString("id-ID")} - {post.budget_max?.toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-400 font-semibold block text-[10px] uppercase">Batas Akhir</span>
                          <span className="font-bold text-neutral-700 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#A1C942]" />
                            {post.deadline}
                          </span>
                        </div>
                        <div className="col-span-2 mt-1">
                          <span className="text-neutral-400 font-semibold block text-[10px] uppercase">Lokasi Pengiriman</span>
                          <span className="font-bold text-neutral-700 flex items-center gap-1 truncate mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-[#FFC000]" />
                            {post.location}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Info: Poster Profile */}
                      <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full overflow-hidden bg-neutral-50 border border-neutral-200 flex items-center justify-center text-xs font-bold text-[#5E8000]">
                            {avatarUrl ? (
                              <img src={avatarUrl} alt={posterName} className="w-full h-full object-cover" />
                            ) : (
                              posterName[0]?.toUpperCase()
                            )}
                          </div>
                          <div className="text-[11px] leading-tight">
                            <span className="font-bold text-neutral-800 block">{posterName}</span>
                            <span className="text-neutral-400">Diposting {postedAt}</span>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-[#5E8000] flex items-center gap-0.5 group">
                          Lihat Detail <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {/* PETANI TAB (FARMER OFFERS TRACKING) */}
        {activeTab === "petani" && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-neutral-200 pb-4">
              <h1 className="text-2xl font-extrabold font-display">Penawaran Saya</h1>
              <p className="text-xs text-neutral-400 mt-1">Pantau status semua penawaran yang telah Anda ajukan ke konsumen</p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-emerald-700">
                {success}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#5E8000]" />
              </div>
            ) : myOffers.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-neutral-100 shadow-sm p-8">
                <TrendingUp className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-neutral-700">Belum ada penawaran</h3>
                <p className="text-xs text-neutral-400 mt-1">Jelajahi tab Marketplace untuk menemukan permintaan pasar yang sesuai.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myOffers.map((offer) => {
                  const offerStatusColors = {
                    pending: "bg-yellow-50 text-yellow-700 border-yellow-100",
                    accepted: "bg-emerald-50 text-emerald-700 border-emerald-100",
                    rejected: "bg-red-50 text-red-700 border-red-100",
                    withdrawn: "bg-neutral-100 text-neutral-600 border-neutral-200",
                    expired: "bg-orange-50 text-orange-700 border-orange-100"
                  };

                  return (
                    <div key={offer.id} className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4 shadow-sm">
                      {/* Context Post Title & Status */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] text-neutral-400 font-semibold block uppercase">Postingan Asal</span>
                          <h4 className="font-bold text-neutral-900 text-sm line-clamp-1">{offer.food_posts?.title || "Kebutuhan Pangan"}</h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize shrink-0 ${offerStatusColors[offer.status] || "bg-neutral-50"}`}>
                          {offer.status}
                        </span>
                      </div>

                      {/* Offer Info */}
                      <div className="bg-neutral-50/50 p-4 rounded-xl border border-neutral-100 text-xs space-y-2">
                        <div>
                          <span className="text-neutral-400 font-medium block text-[9px] uppercase">Barang Ditawarkan</span>
                          <span className="font-bold text-neutral-800">{offer.item_name}</span>
                        </div>
                        {offer.item_description && (
                          <p className="text-neutral-600 line-clamp-2 mt-0.5">{offer.item_description}</p>
                        )}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100">
                          <div>
                            <span className="text-neutral-400 font-medium block text-[9px] uppercase">Harga diajukan</span>
                            <span className="font-bold text-[#5E8000]">Rp {offer.price_per_unit?.toLocaleString("id-ID")}</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 font-medium block text-[9px] uppercase">Jumlah Ditawarkan</span>
                            <span className="font-bold text-neutral-800">{offer.quantity_offered} {offer.food_posts?.unit}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            setLoading(true);
                            try {
                              const res = await fetchFoodPosts();
                              const matchedPost = res.find(p => p.id === offer.post_id);
                              if (matchedPost) {
                                handleOpenPostDetail(matchedPost);
                              } else {
                                alert("Postingan sudah tidak aktif.");
                              }
                            } catch (e) {
                              alert("Gagal membuka detail postingan.");
                            } finally {
                              setLoading(false);
                            }
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-neutral-200 text-neutral-600 font-bold text-xs hover:bg-neutral-50 transition-all cursor-pointer"
                        >
                          <span>Lihat Context Post</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>

                        {offer.status === "pending" && (
                          <button
                            onClick={() => handleWithdrawOffer(offer.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-xs hover:bg-red-100 active:scale-95 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Tarik</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TRANSAKSI TAB */}
        {activeTab === "transaksi" && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-neutral-200 pb-4">
              <h1 className="text-2xl font-extrabold font-display">Kesepakatan & Transaksi</h1>
              <p className="text-xs text-neutral-400 mt-1">Daftar transaksi aktif berdasarkan offer yang telah diterima</p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-emerald-700">
                {success}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#5E8000]" />
              </div>
            ) : myTransactions.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-neutral-100 shadow-sm p-8">
                <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-neutral-700">Belum ada transaksi</h3>
                <p className="text-xs text-neutral-400 mt-1">Transaksi otomatis dibuat setelah penawaran diterima konsumen.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myTransactions.map((tx) => {
                  const txStatusColors = {
                    pending: "bg-yellow-50 text-yellow-700 border-yellow-150",
                    confirmed: "bg-blue-50 text-blue-700 border-blue-150",
                    completed: "bg-emerald-50 text-emerald-700 border-emerald-150",
                    cancelled: "bg-red-50 text-red-700 border-red-150"
                  };

                  const isConsumer = session.profile.role === "konsumen";
                  const partner = isConsumer ? tx.farmer : tx.consumer;
                  const partnerLabel = isConsumer ? "Petani" : "Konsumen";

                  return (
                    <div key={tx.id} className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {/* Left: Info */}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border capitalize ${txStatusColors[tx.status] || "bg-neutral-50"}`}>
                            {tx.status}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-semibold">{new Date(tx.created_at).toLocaleDateString("id-ID")}</span>
                        </div>
                        <h3 className="font-bold text-neutral-900 text-base">{tx.food_posts?.title || "Transaksi Pangan"}</h3>

                        {/* Partner Contact Card */}
                        {partner && (
                          <div className="flex items-center gap-2 mt-1 bg-neutral-50/50 p-2.5 rounded-xl border border-neutral-100 w-fit text-xs">
                            <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-bold text-[#5E8000]">
                              {partner.full_name[0]?.toUpperCase()}
                            </div>
                            <div>
                              <span className="text-neutral-400 font-semibold block text-[8px] uppercase">{partnerLabel}</span>
                              <span className="font-bold text-neutral-800">{partner.full_name} ({partner.whatsapp_number || partner.phone || "-"})</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Middle: Details */}
                      <div className="grid grid-cols-2 gap-4 text-xs shrink-0 bg-neutral-50/50 p-3.5 rounded-xl border border-neutral-100">
                        <div>
                          <span className="text-neutral-400 font-semibold block text-[9px] uppercase">Jumlah Deal</span>
                          <span className="font-bold text-neutral-800 text-sm">{tx.final_quantity} {tx.food_posts?.unit}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 font-semibold block text-[9px] uppercase">Total Harga</span>
                          <span className="font-bold text-[#5E8000] text-sm">Rp {tx.final_price?.toLocaleString("id-ID")}</span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-wrap gap-2 shrink-0 md:w-48">
                        {tx.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleUpdateTxStatus(tx.id, "confirmed")}
                              className="w-full flex items-center justify-center gap-1 py-2 rounded-xl text-white font-bold text-xs bg-[#A1C942] hover:bg-[#5E8000] active:scale-95 transition-all cursor-pointer shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Konfirmasi Deal</span>
                            </button>
                            <button
                              onClick={() => handleUpdateTxStatus(tx.id, "cancelled")}
                              className="w-full flex items-center justify-center gap-1 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-xs hover:bg-red-100 active:scale-95 transition-all cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Batalkan</span>
                            </button>
                          </>
                        )}

                        {tx.status === "confirmed" && (
                          <>
                            <button
                              onClick={() => handleUpdateTxStatus(tx.id, "completed")}
                              className="w-full flex items-center justify-center gap-1 py-2 rounded-xl bg-[#5E8000] text-white font-bold text-xs hover:bg-[#4d6900] active:scale-95 transition-all cursor-pointer shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Transaksi Selesai</span>
                            </button>
                            <button
                              onClick={() => handleUpdateTxStatus(tx.id, "cancelled")}
                              className="w-full flex items-center justify-center gap-1 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-xs hover:bg-red-100 active:scale-95 transition-all cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Batalkan</span>
                            </button>
                          </>
                        )}

                        {tx.status === "completed" && (
                          <button
                            onClick={() => {
                              setSelectedTxForReview(tx);
                              setReviewPayload({ rating: 5, comment: "" });
                            }}
                            className="w-full flex items-center justify-center gap-1 py-2 rounded-xl border border-neutral-200 text-neutral-600 font-bold text-xs hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5 text-[#FFC000]" />
                            <span>Beri Ulasan</span>
                          </button>
                        )}

                        {partner?.whatsapp_number && (
                          <button
                            onClick={() => window.open(`https://wa.me/${partner.whatsapp_number}?text=Halo%20${partner.full_name},%20terkait%20transaksi%20postingan%2520%27${tx.food_posts?.title}%27...`, "_blank")}
                            className="w-full flex items-center justify-center gap-1 py-2 rounded-xl border border-neutral-200 text-neutral-600 font-bold text-xs hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span>WhatsApp Partner</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* AI ASSISTANT TAB */}
        {activeTab === "ai" && (
          <div className="space-y-6">
            
            {/* Header Title */}
            <div className="border-b border-neutral-200 pb-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold font-display">Asisten Lahan Pintar (AI)</h1>
                <p className="text-xs text-neutral-400 mt-1">Dapatkan rekomendasi otomatisasi IoT dan analisis digital twin Lahan Anda</p>
              </div>

              {aiMode !== "recommend" && (
                <button
                  onClick={() => setAiMode("recommend")}
                  className="px-3.5 py-1.5 rounded-lg border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition-all cursor-pointer"
                >
                  Rekomendasi Baru
                </button>
              )}
            </div>

            {/* AI RECOMMENDATION FORM */}
            {aiMode === "recommend" && (
              <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="w-5 h-5 text-[#FFC000]" />
                  <h3 className="text-lg font-bold text-neutral-900">Form Analisis Lahan</h3>
                </div>

                <form onSubmit={handleAIRecommendation} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">Komoditas</label>
                      <input
                        type="text"
                        required
                        value={recommendationForm.komoditas}
                        onChange={(e) => setRecommendationForm({...recommendationForm, komoditas: e.target.value})}
                        className="w-full px-3.5 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5E8000]/20 focus:border-[#5E8000] bg-neutral-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">Luas Lahan (m²)</label>
                      <input
                        type="number"
                        required
                        value={recommendationForm.luas_lahan_m2}
                        onChange={(e) => setRecommendationForm({...recommendationForm, luas_lahan_m2: parseFloat(e.target.value)})}
                        className="w-full px-3.5 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5E8000]/20 focus:border-[#5E8000] bg-neutral-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">Lokasi</label>
                      <input
                        type="text"
                        required
                        value={recommendationForm.lokasi}
                        onChange={(e) => setRecommendationForm({...recommendationForm, lokasi: e.target.value})}
                        className="w-full px-3.5 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5E8000]/20 focus:border-[#5E8000] bg-neutral-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">Maksimal Budget (Rp)</label>
                      <input
                        type="number"
                        required
                        value={recommendationForm.budget}
                        onChange={(e) => setRecommendationForm({...recommendationForm, budget: parseFloat(e.target.value)})}
                        className="w-full px-3.5 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5E8000]/20 focus:border-[#5E8000] bg-neutral-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">Kondisi Lahan Saat Ini</label>
                    <textarea
                      required
                      value={recommendationForm.kondisi_saat_ini}
                      onChange={(e) => setRecommendationForm({...recommendationForm, kondisi_saat_ini: e.target.value})}
                      rows={3}
                      className="w-full px-3.5 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5E8000]/20 focus:border-[#5E8000] bg-neutral-50 focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-[#5E8000] text-white font-bold text-sm hover:bg-[#4d6900] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Menganalisis Lahan...</>
                    ) : (
                      "Analisis Lahan via AI"
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* AI RECOMMENDATION RESULT */}
            {aiMode === "result" && aiResult && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Result Overview card */}
                <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2.5 py-1 rounded-full bg-[#5E8000]/10 text-[#5E8000] text-xxs font-bold uppercase tracking-wider">Hasil Rekomendasi</span>
                      <h2 className="text-xl font-bold mt-2 text-neutral-900">{aiResult.solution_name}</h2>
                    </div>
                    <div className="text-right">
                      <div className="text-xxs text-neutral-400 uppercase font-semibold">Estimasi Total Biaya</div>
                      <div className="text-xl font-bold text-[#5E8000] mt-1">
                        Rp {aiResult.estimated_cost?.toLocaleString("id-ID")}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-neutral-500 leading-relaxed mt-4">{aiResult.description}</p>
                </div>

                {/* IoT Components Recommendations */}
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-neutral-900">Komponen IoT yang Direkomendasikan</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {aiResult.components?.map((comp, idx) => (
                      <div key={idx} className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4 flex gap-4">
                        <div className="w-16 h-16 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center text-2xl shrink-0">🛠</div>
                        <div>
                          <h5 className="font-bold text-sm text-neutral-900">{comp.component_name}</h5>
                          <p className="text-xxs text-neutral-400 mt-0.5 leading-relaxed">{comp.description}</p>
                          <div className="text-xs font-bold text-[#5E8000] mt-2">Rp {comp.price?.toLocaleString("id-ID")}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simulate Digital Twin Button */}
                <div className="p-6 bg-gradient-to-r from-[#5E8000]/10 to-[#A1C942]/10 border border-[#5E8000]/20 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-neutral-900">Simulasikan Digital Twin Lahan Anda</h4>
                    <p className="text-xs text-neutral-500 mt-1">Gunakan model matematika AI untuk memproyeksikan hasil panen, efisiensi air, dan profit.</p>
                  </div>
                  <button
                    onClick={() => handleAISimulation(aiResult.recommendation_id)}
                    className="px-6 py-2.5 rounded-xl bg-[#5E8000] text-white font-bold text-xs hover:bg-[#4d6900] active:scale-95 transition-all shadow-md shadow-[#5E8000]/10 shrink-0 cursor-pointer"
                  >
                    Mulai Simulasi
                  </button>
                </div>
              </div>
            )}

            {/* DIGITAL TWIN SIMULATION RESULT */}
            {aiMode === "simulate" && simulationResult && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Proyeksi Yield */}
                  <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 text-center">
                    <TrendingUp className="w-5 h-5 text-[#A1C942] mx-auto mb-2" />
                    <div className="text-xxs text-neutral-400 uppercase font-semibold">Kenaikan Hasil Panen</div>
                    <div className="text-2xl font-black text-neutral-900 mt-1">+{simulationResult.yield_increase_percent}%</div>
                  </div>

                  {/* Efisiensi Air */}
                  <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 text-center">
                    <Droplets className="w-5 h-5 text-[#5E8000] mx-auto mb-2" />
                    <div className="text-xxs text-neutral-400 uppercase font-semibold">Pengurangan Air</div>
                    <div className="text-2xl font-black text-neutral-900 mt-1">-{simulationResult.water_usage_reduction_percent}%</div>
                  </div>

                  {/* Breakeven */}
                  <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 text-center">
                    <DollarSign className="w-5 h-5 text-[#FFC000] mx-auto mb-2" />
                    <div className="text-xxs text-neutral-400 uppercase font-semibold">Balik Modal (Siklus)</div>
                    <div className="text-2xl font-black text-neutral-900 mt-1">{simulationResult.breakeven_cycle} Panen</div>
                  </div>

                  {/* Keuntungan Bersih */}
                  <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 text-center">
                    <Sparkles className="w-5 h-5 text-[#E1C055] mx-auto mb-2" />
                    <div className="text-xxs text-neutral-400 uppercase font-semibold">Profit Bersih Thn 1</div>
                    <div className="text-base font-black text-neutral-900 mt-1 truncate">
                      Rp {simulationResult.projected_net_profit_year1?.toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>

                {/* AI Insight Text */}
                <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-6">
                  <h4 className="font-bold text-neutral-900 mb-2 flex items-center gap-1.5">
                    <BrainCircuit className="w-4 h-4 text-[#5E8000]" /> Analisis & Solusi AI
                  </h4>
                  <p className="text-sm text-neutral-500 leading-relaxed">{simulationResult.ai_insight_text}</p>
                </div>

                {/* Scenarios Comparison */}
                {simulationResult.scenarios?.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-base font-bold text-neutral-900">Perbandingan Skenario Anggaran</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {simulationResult.scenarios.map((sc, idx) => (
                        <div key={idx} className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-neutral-900">Skenario {sc.scenario_label}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              sc.is_within_budget ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                            }`}>
                              {sc.is_within_budget ? "Sesuai Budget" : "Melebihi Budget"}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <div className="text-neutral-400 font-semibold">Estimasi Biaya</div>
                              <div className="font-bold mt-0.5">Rp {sc.total_cost?.toLocaleString("id-ID")}</div>
                            </div>
                            <div>
                              <div className="text-neutral-400 font-semibold">Proyeksi Hasil</div>
                              <div className="font-bold mt-0.5">{sc.projected_yield_kg} kg</div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-neutral-50">
                            <div className="text-[10px] text-neutral-400 font-semibold">Analisis Mitigasi:</div>
                            <p className="text-xxs text-neutral-500 leading-relaxed mt-1">{sc.ai_recommendation_note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* CREATE POST MODAL (FOR KONSUMEN ROLE ONLY) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-bold text-lg text-neutral-900">Buat Post Kebutuhan Baru</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-neutral-600 font-bold text-sm cursor-pointer"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">Judul Kebutuhan</label>
                <input
                  type="text"
                  required
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  placeholder="Contoh: Butuh pasokan cabai merah segar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5E8000]/20 focus:border-[#5E8000] bg-neutral-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">Deskripsi Detail</label>
                <textarea
                  required
                  value={newPost.description}
                  onChange={(e) => setNewPost({...newPost, description: e.target.value})}
                  placeholder="Detail standar mutu, pengemasan, dll"
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5E8000]/20 focus:border-[#5E8000] bg-neutral-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">Kategori</label>
                  <select
                    required
                    value={newPost.category_id}
                    onChange={(e) => setNewPost({...newPost, category_id: e.target.value})}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none bg-neutral-50 focus:bg-white"
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">Jumlah</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      required
                      value={newPost.quantity_needed}
                      onChange={(e) => setNewPost({...newPost, quantity_needed: e.target.value})}
                      placeholder="500"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5E8000]/20 focus:border-[#5E8000] bg-neutral-50 focus:bg-white"
                    />
                    <select
                      value={newPost.unit}
                      onChange={(e) => setNewPost({...newPost, unit: e.target.value})}
                      className="px-2.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none bg-neutral-50 focus:bg-white"
                    >
                      <option value="kg">kg</option>
                      <option value="ton">ton</option>
                      <option value="ikat">ikat</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">Budget Min</label>
                  <input
                    type="number"
                    required
                    value={newPost.budget_min}
                    onChange={(e) => setNewPost({...newPost, budget_min: e.target.value})}
                    placeholder="Harga minimum"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5E8000]/20 focus:border-[#5E8000] bg-neutral-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">Budget Max</label>
                  <input
                    type="number"
                    required
                    value={newPost.budget_max}
                    onChange={(e) => setNewPost({...newPost, budget_max: e.target.value})}
                    placeholder="Harga maksimum"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5E8000]/20 focus:border-[#5E8000] bg-neutral-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">Lokasi Pengiriman</label>
                  <input
                    type="text"
                    required
                    value={newPost.location}
                    onChange={(e) => setNewPost({...newPost, location: e.target.value})}
                    placeholder="Kota / Daerah"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5E8000]/20 focus:border-[#5E8000] bg-neutral-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">Batas Akhir (Deadline)</label>
                  <input
                    type="date"
                    required
                    value={newPost.deadline}
                    onChange={(e) => setNewPost({...newPost, deadline: e.target.value})}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5E8000]/20 focus:border-[#5E8000] bg-neutral-50 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#5E8000] text-white font-bold text-sm hover:bg-[#4d6900] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
                ) : (
                  "Kirim Postingan Kebutuhan"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* POST DETAIL DRAWER */}
      {selectedPost && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity">
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl p-6 sm:p-8 flex flex-col justify-between animate-fade-in">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="font-bold text-lg text-neutral-900">Detail Permintaan</h3>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="text-neutral-400 hover:text-neutral-600 cursor-pointer p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Post Details */}
              <div className="space-y-4">
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[10px] font-bold">
                    {selectedPost.categories?.name || "Lainnya"}
                  </span>
                  <h2 className="text-xl font-bold text-neutral-900 mt-2">{selectedPost.title}</h2>
                  <p className="text-xs text-neutral-500 mt-1">Diposting oleh {selectedPost.profiles?.full_name || "Konsumen"}</p>
                </div>

                <p className="text-sm text-neutral-600 leading-relaxed bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                  {selectedPost.description}
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs bg-neutral-50/50 p-4 rounded-2xl border border-neutral-100/50">
                  <div>
                    <span className="text-neutral-400 font-semibold block text-[10px] uppercase">Jumlah Dibutuhkan</span>
                    <span className="font-bold text-neutral-800 text-sm">
                      {selectedPost.quantity_needed} {selectedPost.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 font-semibold block text-[10px] uppercase">Jumlah Terpenuhi</span>
                    <span className="font-bold text-[#5E8000] text-sm">
                      {selectedPost.quantity_fulfilled || 0} {selectedPost.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 font-semibold block text-[10px] uppercase">Budget / Unit</span>
                    <span className="font-bold text-[#5E8000] text-sm">
                      Rp {selectedPost.budget_min?.toLocaleString("id-ID")} - {selectedPost.budget_max?.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 font-semibold block text-[10px] uppercase">Batas Akhir</span>
                    <span className="font-bold text-neutral-700 text-sm flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#A1C942]" />
                      {selectedPost.deadline}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-neutral-400 font-semibold block text-[10px] uppercase">Lokasi Pengiriman</span>
                    <span className="font-bold text-neutral-700 text-sm flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-4 h-4 text-[#FFC000]" />
                      {selectedPost.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cancel Button (Owner only, if open) */}
              {selectedPost.consumer_id === session.profile.id && selectedPost.status === "open" && (
                <button
                  onClick={() => handleCancelPost(selectedPost.id)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 text-red-600 font-bold text-xs hover:bg-red-50 active:scale-98 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Batalkan Postingan</span>
                </button>
              )}

              {/* Offers Section */}
              <div className="space-y-4 border-t border-neutral-100 pt-6">
                <h4 className="font-bold text-neutral-900 text-sm">
                  {selectedPost.consumer_id === session.profile.id ? "Daftar Penawaran Masuk" : "Penawaran Anda"}
                </h4>

                {postOffers.length === 0 ? (
                  <div className="text-center py-8 bg-neutral-50/50 rounded-2xl border border-dashed border-neutral-200">
                    <p className="text-xs text-neutral-400 font-medium">Belum ada penawaran.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {postOffers.map((offer) => {
                      const farmerName = offer.profiles?.full_name || "Petani";
                      const offerStatusColors = {
                        pending: "bg-yellow-50 text-yellow-700 border-yellow-100",
                        accepted: "bg-emerald-50 text-emerald-700 border-emerald-100",
                        rejected: "bg-red-50 text-red-700 border-red-100",
                        withdrawn: "bg-neutral-100 text-neutral-600 border-neutral-200",
                        expired: "bg-orange-50 text-orange-700 border-orange-100"
                      };

                      return (
                        <div key={offer.id} className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-3.5 shadow-xs">
                          {/* Farmer info & Status */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-neutral-50 border border-neutral-200 flex items-center justify-center text-xs font-bold text-[#5E8000]">
                                {offer.profiles?.avatar_url ? (
                                  <img src={offer.profiles.avatar_url} alt={farmerName} className="w-full h-full object-cover" />
                                ) : (
                                  farmerName[0]?.toUpperCase()
                                )}
                              </div>
                              <div>
                                <span className="font-bold text-xs text-neutral-800 block">{farmerName}</span>
                                <span className="text-[10px] text-[#A1C942] font-semibold">Petani Terverifikasi</span>
                              </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border capitalize ${offerStatusColors[offer.status] || "bg-neutral-50"}`}>
                              {offer.status}
                            </span>
                          </div>

                          {/* Offer Details */}
                          <div className="space-y-1.5 text-xs bg-neutral-50/50 p-3 rounded-xl border border-neutral-100/50">
                            <div>
                              <span className="text-neutral-400 font-medium block text-[9px]">Nama Barang</span>
                              <span className="font-bold text-neutral-800">{offer.item_name}</span>
                            </div>
                            {offer.item_description && (
                              <div>
                                <span className="text-neutral-400 font-medium block text-[9px]">Deskripsi</span>
                                <p className="text-neutral-600 leading-relaxed mt-0.5">{offer.item_description}</p>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <div>
                                <span className="text-neutral-400 font-medium block text-[9px]">Harga / Unit</span>
                                <span className="font-bold text-[#5E8000]">Rp {offer.price_per_unit?.toLocaleString("id-ID")}</span>
                              </div>
                              <div>
                                <span className="text-neutral-400 font-medium block text-[9px]">Jumlah Ditawarkan</span>
                                <span className="font-bold text-neutral-800">{offer.quantity_offered} {selectedPost.unit}</span>
                              </div>
                            </div>
                            {offer.message && (
                              <div className="pt-2 border-t border-neutral-100 mt-2">
                                <span className="text-neutral-400 font-medium block text-[9px]">Pesan Petani</span>
                                <p className="text-neutral-600 italic mt-0.5">"{offer.message}"</p>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            {/* WhatsApp Button */}
                            {offer.status === "pending" && (
                              <button
                                onClick={() => handleWhatsAppContact(offer.id)}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl border border-neutral-200 text-neutral-600 font-bold text-[11px] hover:bg-neutral-50 active:scale-98 transition-all cursor-pointer"
                              >
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Hubungi</span>
                              </button>
                            )}

                            {/* Consumer Actions */}
                            {selectedPost.consumer_id === session.profile.id && offer.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleAcceptOffer(offer.id)}
                                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-[#5E8000] text-white font-bold text-[11px] hover:bg-[#4d6900] active:scale-98 transition-all cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Terima</span>
                                </button>
                                <button
                                  onClick={() => handleRejectOffer(offer.id)}
                                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 font-bold text-[11px] hover:bg-red-100 active:scale-98 transition-all cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Tolak</span>
                                </button>
                              </>
                            )}

                            {/* Farmer Retract Action */}
                            {offer.farmer_id === session.profile.id && offer.status === "pending" && (
                              <button
                                onClick={() => handleWithdrawOffer(offer.id)}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 font-bold text-[11px] hover:bg-red-100 active:scale-98 transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Tarik</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Farmer Submit Offer Trigger */}
            {session.profile.role === "petani" && 
             selectedPost.status === "open" && 
             !postOffers.some(o => o.farmer_id === session.profile.id) && (
              <button
                onClick={() => setShowOfferModal(true)}
                className="w-full mt-6 py-3 rounded-xl bg-[#5E8000] text-white font-bold text-sm hover:bg-[#4d6900] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajukan Penawaran Sekarang</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* SUBMIT OFFER MODAL (FOR PETANI ONLY) */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-bold text-lg text-neutral-900">Ajukan Penawaran</h3>
              <button 
                onClick={() => setShowOfferModal(false)}
                className="text-neutral-400 hover:text-neutral-600 font-bold text-sm cursor-pointer"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleSubmitOffer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">Nama Barang</label>
                <input
                  type="text"
                  required
                  value={offerPayload.item_name}
                  onChange={(e) => setOfferPayload({...offerPayload, item_name: e.target.value})}
                  placeholder="Contoh: Cabai Merah Besar Kualitas Super"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5E8000]/20 focus:border-[#5E8000] bg-neutral-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">Deskripsi Barang</label>
                <textarea
                  required
                  value={offerPayload.item_description}
                  onChange={(e) => setOfferPayload({...offerPayload, item_description: e.target.value})}
                  placeholder="Kadar air rendah, baru dipetik, dll"
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5E8000]/20 focus:border-[#5E8000] bg-neutral-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">Harga per Unit (Rp)</label>
                  <input
                    type="number"
                    required
                    value={offerPayload.price_per_unit}
                    onChange={(e) => setOfferPayload({...offerPayload, price_per_unit: e.target.value})}
                    placeholder="Harga unit"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5E8000]/20 focus:border-[#5E8000] bg-neutral-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">Jumlah Ditawarkan</label>
                  <input
                    type="number"
                    required
                    value={offerPayload.quantity_offered}
                    onChange={(e) => setOfferPayload({...offerPayload, quantity_offered: e.target.value})}
                    placeholder="Jumlah unit"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5E8000]/20 focus:border-[#5E8000] bg-[#f7f9f4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">Pesan Tambahan (Opsional)</label>
                <textarea
                  value={offerPayload.message}
                  onChange={(e) => setOfferPayload({...offerPayload, message: e.target.value})}
                  placeholder="Catatan pengiriman, pengemasan, dll"
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5E8000]/20 focus:border-[#5E8000] bg-neutral-50 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#5E8000] text-white font-bold text-sm hover:bg-[#4d6900] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</>
                ) : (
                  "Kirim Penawaran"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REVIEW SUBMISSION MODAL */}
      {selectedTxForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-bold text-lg text-neutral-900">Beri Ulasan Transaksi</h3>
              <button 
                onClick={() => setSelectedTxForReview(null)}
                className="text-neutral-400 hover:text-neutral-600 font-bold text-sm cursor-pointer"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewPayload({...reviewPayload, rating: star})}
                      className="p-1 cursor-pointer transform hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= reviewPayload.rating ? "text-[#FFC000] fill-[#FFC000]" : "text-neutral-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">Komentar / Ulasan</label>
                <textarea
                  required
                  value={reviewPayload.comment}
                  onChange={(e) => setReviewPayload({...reviewPayload, comment: e.target.value})}
                  placeholder="Tulis ulasan Anda terkait kualitas barang, pengiriman, atau kerja sama..."
                  rows={4}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5E8000]/20 focus:border-[#5E8000] bg-neutral-50 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#5E8000] text-white font-bold text-sm hover:bg-[#4d6900] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</>
                ) : (
                  "Kirim Ulasan"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
