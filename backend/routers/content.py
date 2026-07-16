from fastapi import APIRouter, HTTPException
from typing import Optional
from utils.supabase import get_admin_client
from config import logger

router = APIRouter(tags=["Education & FAQs"])

# Fallback articles in case database is empty
SAMPLE_ARTICLES = [
    {
        "title": "Rotasi Tanaman untuk Menjaga Nutrisi Tanah",
        "content": (
            "Praktik rotasi tanaman sangat penting di lahan subur Indonesia untuk menjaga "
            "keseimbangan hara. Dengan menanam tanaman yang berbeda secara bergantian "
            "(misalnya kacang-kacangan setelah padi), kita membantu memfiksasi nitrogen bebas "
            "dan menghentikan siklus hidup hama tanah. Ini mempromosikan praktik berkelanjutan "
            "yang melindungi kesehatan tanah jangka panjang."
        ),
        "category": "sustainability"
    },
    {
        "title": "Mengurangi Pestisida Kimia dengan Pestisida Organik",
        "content": (
            "Penggunaan pestisida organik yang diramu dari ekstrak daun mimba, gadung, atau serai "
            "dapat membasmi hama secara ramah lingkungan. Hal ini mengurangi pencemaran racun "
            "pada tanah dan melindungi keanekaragaman hayati maritim dari limpasan limpah residu kimia."
        ),
        "category": "sustainability"
    },
    {
        "title": "Penerapan Irigasi Pintar (Smart Irrigation) di Lahan Kering",
        "content": (
            "Smart Irrigation mengandalkan sensor kelembaban untuk mendistribusikan air secara efisien. "
            "Ini menghemat air hingga 40% dan mencegah pencucian nutrisi tanah akibat penyiraman berlebih."
        ),
        "category": "iot"
    }
]

SAMPLE_FAQS = [
    {
        "question": "Apakah TaniTech menjual alat IoT secara langsung?",
        "answer": (
            "Tidak, TaniTech adalah platform rekomendasi dan simulator. Kami menganalisa lahan Anda "
            "dan menyarankan komponen IoT yang bisa Anda beli di toko online/offline mitra terdekat."
        )
    },
    {
        "question": "Bagaimana cara menghubungi petani di marketplace?",
        "answer": (
            "Begitu petani mengajukan penawaran (offer) pada post kebutuhan pangan Anda, Anda dapat "
            "menekan tombol 'Hubungi via WhatsApp' untuk mulai bernegosiasi secara langsung."
        )
    },
    {
        "question": "Bagaimana cara kerja Digital Twin Simulation?",
        "answer": (
            "Kami mensimulasikan dampak pemasangan alat IoT terhadap proyeksi hasil panen, siklus "
            "balik modal (break-even), dan pengurangan risiko lingkungan menggunakan model AI reasoning."
        )
    }
]

def ensure_initial_content():
    """
    Helper function to pre-populate database tables if they are empty.
    """
    admin_client = get_admin_client()
    try:
        # Check education_articles
        art_res = admin_client.table("education_articles").select("id").limit(1).execute()
        if not art_res.data:
            logger.info("Pre-populating education articles...")
            admin_client.table("education_articles").insert(SAMPLE_ARTICLES).execute()
            
        # Check faqs
        faq_res = admin_client.table("faqs").select("id").limit(1).execute()
        if not faq_res.data:
            logger.info("Pre-populating FAQs...")
            admin_client.table("faqs").insert(SAMPLE_FAQS).execute()
            
        # Check categories (marketplace)
        cat_res = admin_client.table("categories").select("id").limit(1).execute()
        if not cat_res.data:
            logger.info("Pre-populating food categories...")
            admin_client.table("categories").insert([
                {"name": "Beras & Biji-bijian"},
                {"name": "Sayuran Segar"},
                {"name": "Buah-buahan"},
                {"name": "Rempah & Bumbu"},
                {"name": "Pangan Pokok Lainnya"}
            ]).execute()
            
    except Exception as e:
        logger.error(f"Error pre-populating database content: {e}")

@router.get("/api/articles")
def list_articles(category: Optional[str] = None):
    """
    Retrieves the list of education articles, with optional category filtering (e.g. 'sustainability').
    """
    admin_client = get_admin_client()
    try:
        ensure_initial_content()
        query = admin_client.table("education_articles").select("*")
        if category:
            query = query.eq("category", category)
            
        res = query.order("created_at", desc=True).execute()
        return res.data or SAMPLE_ARTICLES
    except Exception as e:
        logger.error(f"Error fetching articles: {e}")
        # Return static samples on db issues
        if category:
            return [a for a in SAMPLE_ARTICLES if a["category"] == category]
        return SAMPLE_ARTICLES

@router.get("/api/articles/{id}")
def get_article_detail(id: str):
    """
    Retrieves details of a specific article.
    """
    admin_client = get_admin_client()
    try:
        res = admin_client.table("education_articles").select("*").eq("id", id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Article not found")
        return res.data[0]
    except Exception as e:
        logger.error(f"Error fetching article detail: {e}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/api/faqs")
def list_faqs():
    """
    Retrieves the list of FAQs.
    """
    admin_client = get_admin_client()
    try:
        ensure_initial_content()
        res = admin_client.table("faqs").select("*").execute()
        return res.data or SAMPLE_FAQS
    except Exception as e:
        logger.error(f"Error fetching FAQs: {e}")
        return SAMPLE_FAQS

@router.get("/api/categories")
def list_categories():
    """
    Retrieves the list of categories for food posts.
    """
    admin_client = get_admin_client()
    try:
        ensure_initial_content()
        res = admin_client.table("categories").select("*").execute()
        return res.data or []
    except Exception as e:
        logger.error(f"Error fetching categories: {e}")
        raise HTTPException(status_code=400, detail=str(e))
