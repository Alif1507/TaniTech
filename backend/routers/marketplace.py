from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from utils.supabase import get_supabase_client, get_admin_client
from deps import get_current_user, get_token_header
from config import logger
import urllib.parse
from datetime import date

router = APIRouter(tags=["Marketplace"])

# Pydantic validation schemas
class FoodPostCreate(BaseModel):
    title: str
    description: str
    category_id: str
    quantity_needed: float
    unit: str
    budget_min: float
    budget_max: float
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    deadline: date

class OfferCreate(BaseModel):
    item_name: str
    item_description: str
    image_url: Optional[str] = None
    price_per_unit: float
    quantity_offered: float
    message: Optional[str] = None

class TransactionStatusUpdate(BaseModel):
    status: str # 'confirmed' | 'completed' | 'cancelled'

class ReviewCreate(BaseModel):
    transaction_id: str
    rating: int # 1-5
    comment: Optional[str] = None

# ---------------------------------------------------------
# FOOD POST ENDPOINTS
# ---------------------------------------------------------

@router.post("/api/posts")
def create_food_post(
    req: FoodPostCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    token: str = Depends(get_token_header)
):
    """
    Consumer creates a food post asking for food supply.
    """
    if current_user["role"] != "konsumen":
        raise HTTPException(
            status_code=403,
            detail="Only users with the role 'konsumen' can create food posts"
        )
        
    client = get_supabase_client(token)
    payload = {
        "consumer_id": current_user["id"],
        "title": req.title,
        "description": req.description,
        "category_id": req.category_id,
        "quantity_needed": req.quantity_needed,
        "unit": req.unit,
        "budget_min": req.budget_min,
        "budget_max": req.budget_max,
        "location": req.location,
        "latitude": req.latitude,
        "longitude": req.longitude,
        "deadline": req.deadline.isoformat(),
        "status": "open"
    }
    
    try:
        res = client.table("food_posts").insert(payload).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to create food post")
        return res.data[0]
    except Exception as e:
        logger.error(f"Error creating food post: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/api/posts")
def list_food_posts(
    category_id: Optional[str] = None,
    status: Optional[str] = None,
    location: Optional[str] = None,
    budget_max: Optional[float] = None
):
    """
    Public listing of all food posts, with optional filters.
    """
    admin_client = get_admin_client()
    query = admin_client.table("food_posts").select("*, profiles:consumer_id(full_name, avatar_url), categories:category_id(name)")
    
    if category_id:
        query = query.eq("category_id", category_id)
    if status:
        query = query.eq("status", status)
    else:
        # Default show only open/partially fulfilled ones
        query = query.in_("status", ["open", "partially_fulfilled"])
    if location:
        query = query.ilike("location", f"%{location}%")
    if budget_max:
        query = query.lte("budget_max", budget_max)
        
    try:
        res = query.order("created_at", desc=True).execute()
        return res.data or []
    except Exception as e:
        logger.error(f"Error listing food posts: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/api/posts/mine")
def get_my_posts(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Retrieves the food posts created by the logged in consumer.
    """
    admin_client = get_admin_client()
    try:
        res = admin_client.table("food_posts").select("*, categories:category_id(name)").eq("consumer_id", current_user["id"]).order("created_at", desc=True).execute()
        return res.data or []
    except Exception as e:
        logger.error(f"Error fetching consumer food posts: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/api/posts/{id}")
def get_food_post_details(id: str):
    """
    Retrieves detail of a food post, including details of the consumer.
    """
    admin_client = get_admin_client()
    try:
        res = admin_client.table("food_posts").select("*, profiles:consumer_id(full_name, avatar_url, phone, whatsapp_number), categories:category_id(name)").eq("id", id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Food post not found")
        return res.data[0]
    except Exception as e:
        logger.error(f"Error fetching food post details: {e}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/api/posts/{id}")
def edit_food_post(
    id: str,
    req: FoodPostCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    token: str = Depends(get_token_header)
):
    """
    Allows the owner of a food post to update it.
    """
    client = get_supabase_client(token)
    
    # Check ownership
    admin_client = get_admin_client()
    existing_res = admin_client.table("food_posts").select("consumer_id").eq("id", id).execute()
    if not existing_res.data:
        raise HTTPException(status_code=404, detail="Food post not found")
    if existing_res.data[0]["consumer_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied. You do not own this post.")
        
    payload = {
        "title": req.title,
        "description": req.description,
        "category_id": req.category_id,
        "quantity_needed": req.quantity_needed,
        "unit": req.unit,
        "budget_min": req.budget_min,
        "budget_max": req.budget_max,
        "location": req.location,
        "latitude": req.latitude,
        "longitude": req.longitude,
        "deadline": req.deadline.isoformat()
    }
    
    try:
        res = client.table("food_posts").update(payload).eq("id", id).execute()
        return res.data[0]
    except Exception as e:
        logger.error(f"Error updating food post: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/api/posts/{id}")
def delete_food_post(
    id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    token: str = Depends(get_token_header)
):
    """
    Cancels/deletes a food post (owner only).
    """
    client = get_supabase_client(token)
    
    admin_client = get_admin_client()
    existing_res = admin_client.table("food_posts").select("consumer_id").eq("id", id).execute()
    if not existing_res.data:
        raise HTTPException(status_code=404, detail="Food post not found")
    if existing_res.data[0]["consumer_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied. You do not own this post.")
        
    try:
        # Instead of hard delete, update status to cancelled
        res = client.table("food_posts").update({"status": "cancelled"}).eq("id", id).execute()
        return {"message": "Food post successfully cancelled", "post": res.data[0]}
    except Exception as e:
        logger.error(f"Error deleting food post: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# ---------------------------------------------------------
# OFFERS ENDPOINTS
# ---------------------------------------------------------

@router.post("/api/posts/{post_id}/offers")
def submit_offer(
    post_id: str,
    req: OfferCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    token: str = Depends(get_token_header)
):
    """
    Farmer submits a bid offer to fulfill a food post requirement.
    """
    if current_user["role"] != "petani":
        raise HTTPException(
            status_code=403,
            detail="Only farmers (role: 'petani') can submit offers"
        )
        
    # Check if food post is open
    admin_client = get_admin_client()
    post_res = admin_client.table("food_posts").select("status", "consumer_id").eq("id", post_id).execute()
    if not post_res.data:
        raise HTTPException(status_code=404, detail="Food post not found")
        
    post = post_res.data[0]
    if post["status"] not in ["open", "partially_fulfilled"]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot submit offer to a food post with status: {post['status']}"
        )
        
    if post["consumer_id"] == current_user["id"]:
        raise HTTPException(
            status_code=400,
            detail="You cannot bid on your own food post"
        )
        
    client = get_supabase_client(token)
    payload = {
        "post_id": post_id,
        "farmer_id": current_user["id"],
        "item_name": req.item_name,
        "item_description": req.item_description,
        "image_url": req.image_url,
        "price_per_unit": req.price_per_unit,
        "quantity_offered": req.quantity_offered,
        "message": req.message,
        "status": "pending"
    }
    
    try:
        res = client.table("post_offers").insert(payload).execute()
        
        # Create an in-app notification for the consumer
        noti_payload = {
            "user_id": post["consumer_id"],
            "title": "Penawaran Baru Masuk",
            "message": f"Petani {current_user['full_name']} mengajukan penawaran untuk post Anda: '{req.item_name}'."
        }
        admin_client.table("notifications").insert(noti_payload).execute()
        
        return res.data[0]
    except Exception as e:
        logger.error(f"Error submitting offer: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/api/posts/{post_id}/offers")
def list_post_offers(
    post_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Retrieves all offers submitted for a specific food post.
    Access restricted to post owner or farmers who bid.
    """
    admin_client = get_admin_client()
    
    # Fetch food post
    post_res = admin_client.table("food_posts").select("consumer_id").eq("id", post_id).execute()
    if not post_res.data:
        raise HTTPException(status_code=404, detail="Food post not found")
        
    post = post_res.data[0]
    
    # Retrieve offers
    offers_res = admin_client.table("post_offers").select("*, profiles:farmer_id(full_name, phone, whatsapp_number, avatar_url)").eq("post_id", post_id).execute()
    offers = offers_res.data or []
    
    # Enforce access policy
    is_owner = post["consumer_id"] == current_user["id"]
    if is_owner:
        return offers
    else:
        # Farmers can only see their own offers for this post
        return [o for o in offers if o["farmer_id"] == current_user["id"]]

@router.get("/api/offers/mine")
def get_my_offers(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Retrieves all offers submitted by the logged in farmer.
    """
    admin_client = get_admin_client()
    try:
        res = admin_client.table("post_offers").select("*, food_posts:post_id(title, unit, status)").eq("farmer_id", current_user["id"]).order("created_at", desc=True).execute()
        return res.data or []
    except Exception as e:
        logger.error(f"Error fetching farmer offers: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/api/offers/{offer_id}/accept")
def accept_offer(
    offer_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    token: str = Depends(get_token_header)
):
    """
    Consumer accepts a farmer's offer.
    Auto-generates a transaction and updates the post fulfillment status.
    """
    admin_client = get_admin_client()
    
    # Fetch offer details
    offer_res = admin_client.table("post_offers").select("*, food_posts:post_id(consumer_id, title, quantity_needed, quantity_fulfilled)").eq("id", offer_id).execute()
    if not offer_res.data:
        raise HTTPException(status_code=404, detail="Offer not found")
        
    offer = offer_res.data[0]
    post = offer["food_posts"]
    
    if post["consumer_id"] != current_user["id"]:
        raise HTTPException(
            status_code=403,
            detail="Access denied. You do not own the food post for this offer."
        )
        
    if offer["status"] != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot accept offer with status: {offer['status']}"
        )
        
    user_client = get_supabase_client(token)
    try:
        # Update offer status to accepted (triggers post quantity_fulfilled recalculation in DB)
        offer_update_res = user_client.table("post_offers").update({"status": "accepted"}).eq("id", offer_id).execute()
        
        # Calculate final price & quantity
        final_price = float(offer["price_per_unit"]) * float(offer["quantity_offered"])
        final_quantity = offer["quantity_offered"]
        
        # Create transaction record
        tx_payload = {
            "post_id": offer["post_id"],
            "offer_id": offer_id,
            "consumer_id": current_user["id"],
            "farmer_id": offer["farmer_id"],
            "final_price": final_price,
            "final_quantity": final_quantity,
            "status": "pending"
        }
        tx_res = admin_client.table("transactions").insert(tx_payload).execute()
        
        # Send Notification to Farmer
        noti_payload = {
            "user_id": offer["farmer_id"],
            "title": "Penawaran Diterima!",
            "message": f"Selamat! Penawaran Anda untuk post '{post['title']}' telah diterima. Silakan konfirmasi kesepakatan transaksi."
        }
        admin_client.table("notifications").insert(noti_payload).execute()
        
        return {
            "message": "Offer accepted successfully. Transaction record created.",
            "offer": offer_update_res.data[0],
            "transaction": tx_res.data[0] if tx_res.data else None
        }
    except Exception as e:
        logger.error(f"Error accepting offer: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/api/offers/{offer_id}/reject")
def reject_offer(
    offer_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    token: str = Depends(get_token_header)
):
    """
    Consumer rejects a farmer's offer.
    """
    admin_client = get_admin_client()
    offer_res = admin_client.table("post_offers").select("*, food_posts:post_id(consumer_id, title)").eq("id", offer_id).execute()
    if not offer_res.data:
        raise HTTPException(status_code=404, detail="Offer not found")
        
    offer = offer_res.data[0]
    post = offer["food_posts"]
    
    if post["consumer_id"] != current_user["id"]:
        raise HTTPException(
            status_code=403,
            detail="Access denied. You do not own the food post for this offer."
        )
        
    if offer["status"] != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot reject offer with status: {offer['status']}"
        )
        
    user_client = get_supabase_client(token)
    try:
        res = user_client.table("post_offers").update({"status": "rejected"}).eq("id", offer_id).execute()
        
        # Send notification to Farmer
        noti_payload = {
            "user_id": offer["farmer_id"],
            "title": "Penawaran Ditolak",
            "message": f"Penawaran Anda untuk post '{post['title']}' ditolak oleh konsumen."
        }
        admin_client.table("notifications").insert(noti_payload).execute()
        
        return res.data[0]
    except Exception as e:
        logger.error(f"Error rejecting offer: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/api/offers/{offer_id}")
def withdraw_offer(
    offer_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    token: str = Depends(get_token_header)
):
    """
    Farmer withdraws/cancels their offer (only if it is still pending).
    """
    admin_client = get_admin_client()
    offer_res = admin_client.table("post_offers").select("farmer_id", "status").eq("id", offer_id).execute()
    if not offer_res.data:
        raise HTTPException(status_code=404, detail="Offer not found")
        
    offer = offer_res.data[0]
    if offer["farmer_id"] != current_user["id"]:
        raise HTTPException(
            status_code=403,
            detail="Access denied. You can only withdraw your own offer."
        )
        
    if offer["status"] != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot withdraw an offer that is already {offer['status']}"
        )
        
    user_client = get_supabase_client(token)
    try:
        res = user_client.table("post_offers").update({"status": "withdrawn"}).eq("id", offer_id).execute()
        return {"message": "Offer withdrawn successfully", "offer": res.data[0]}
    except Exception as e:
        logger.error(f"Error withdrawing offer: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/api/offers/{offer_id}/contact")
def get_whatsapp_contact_link(
    offer_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Generates a WhatsApp URL link for the consumer to contact the farmer.
    Accessible since the offer is pending.
    """
    admin_client = get_admin_client()
    offer_res = admin_client.table("post_offers").select("*, profiles:farmer_id(full_name, whatsapp_number), food_posts:post_id(consumer_id, title)").eq("id", offer_id).execute()
    if not offer_res.data:
        raise HTTPException(status_code=404, detail="Offer not found")
        
    offer = offer_res.data[0]
    post = offer["food_posts"]
    farmer_profile = offer["profiles"]
    
    # Ownership Check: Only the post owner (consumer) or the bidding farmer can get contact details
    if post["consumer_id"] != current_user["id"] and offer["farmer_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
        
    if not farmer_profile or not farmer_profile.get("whatsapp_number"):
        raise HTTPException(
            status_code=400,
            detail="WhatsApp number for this farmer is not configured in their profile"
        )
        
    wa_num = farmer_profile["whatsapp_number"]
    
    # Construct automated chat template
    text_template = (
        f"Halo {farmer_profile['full_name']},\n\n"
        f"Saya tertarik dengan penawaran Anda untuk post Kebutuhan Pangan '{post['title']}':\n"
        f"- Barang: {offer['item_name']}\n"
        f"- Harga: Rp {offer['price_per_unit']:,}/unit\n"
        f"- Jumlah Penawaran: {offer['quantity_offered']}\n\n"
        f"Bisa kita nego detail pengiriman dan pembayarannya lebih lanjut?"
    )
    
    encoded_text = urllib.parse.quote(text_template)
    whatsapp_url = f"https://wa.me/{wa_num}?text={encoded_text}"
    
    return {
        "whatsapp_url": whatsapp_url,
        "whatsapp_number": wa_num,
        "farmer_name": farmer_profile["full_name"]
    }

# ---------------------------------------------------------
# TRANSACTIONS ENDPOINTS
# ---------------------------------------------------------

@router.get("/api/transactions/mine")
def get_my_transactions(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Retrieves transactions involving the authenticated consumer or farmer.
    """
    admin_client = get_admin_client()
    user_id = current_user["id"]
    role = current_user["role"]
    
    query = admin_client.table("transactions").select("*, food_posts:post_id(title, unit), consumer:consumer_id(full_name, phone, whatsapp_number), farmer:farmer_id(full_name, phone, whatsapp_number)")
    
    if role == "konsumen":
        query = query.eq("consumer_id", user_id)
    elif role == "petani":
        query = query.eq("farmer_id", user_id)
        
    try:
        res = query.order("created_at", desc=True).execute()
        return res.data or []
    except Exception as e:
        logger.error(f"Error fetching user transactions: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/api/transactions/{id}")
def get_transaction_details(
    id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Retrieves details of a specific transaction. Parties must be involved.
    """
    admin_client = get_admin_client()
    try:
        res = admin_client.table("transactions").select("*, food_posts:post_id(title, unit), consumer:consumer_id(full_name, phone, whatsapp_number), farmer:farmer_id(full_name, phone, whatsapp_number)").eq("id", id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Transaction not found")
            
        tx = res.data[0]
        # Access policy
        if tx["consumer_id"] != current_user["id"] and tx["farmer_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Access denied")
            
        return tx
    except Exception as e:
        logger.error(f"Error fetching transaction details: {e}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/api/transactions/{id}/status")
def update_transaction_status(
    id: str,
    req: TransactionStatusUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    token: str = Depends(get_token_header)
):
    """
    Updates the transaction agreement status (confirmed | completed | cancelled).
    Both consumer and farmer can toggle status.
    """
    if req.status not in ["confirmed", "completed", "cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid status. Allowed: confirmed, completed, cancelled")
        
    admin_client = get_admin_client()
    tx_res = admin_client.table("transactions").select("*").eq("id", id).execute()
    if not tx_res.data:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    tx = tx_res.data[0]
    
    # Ownership Check
    if tx["consumer_id"] != current_user["id"] and tx["farmer_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
        
    user_client = get_supabase_client(token)
    try:
        res = user_client.table("transactions").update({"status": req.status}).eq("id", id).execute()
        
        # Send Notification to the other party
        other_party_id = tx["farmer_id"] if current_user["id"] == tx["consumer_id"] else tx["consumer_id"]
        role_label = "Konsumen" if current_user["role"] == "konsumen" else "Petani"
        
        noti_payload = {
            "user_id": other_party_id,
            "title": f"Status Transaksi Diupdate",
            "message": f"{role_label} {current_user['full_name']} mengubah status transaksi menjadi '{req.status}'."
        }
        admin_client.table("notifications").insert(noti_payload).execute()
        
        return res.data[0]
    except Exception as e:
        logger.error(f"Error updating transaction status: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# ---------------------------------------------------------
# REVIEWS ENDPOINTS
# ---------------------------------------------------------

@router.post("/api/reviews")
def write_review(
    req: ReviewCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    token: str = Depends(get_token_header)
):
    """
    Creates review feedback on completed transactions.
    """
    if req.rating < 1 or req.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
        
    admin_client = get_admin_client()
    
    # Fetch transaction details
    tx_res = admin_client.table("transactions").select("*").eq("id", req.transaction_id).execute()
    if not tx_res.data:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    tx = tx_res.data[0]
    if tx["status"] != "completed":
        raise HTTPException(
            status_code=400,
            detail="Reviews can only be written for completed transactions"
        )
        
    # Check if current user is involved in transaction
    if current_user["id"] == tx["consumer_id"]:
        reviewee_id = tx["farmer_id"]
    elif current_user["id"] == tx["farmer_id"]:
        reviewee_id = tx["consumer_id"]
    else:
        raise HTTPException(
            status_code=403,
            detail="Access denied. You are not involved in this transaction."
        )
        
    # Check if reviewer has already reviewed this transaction
    existing_review = admin_client.table("reviews").select("id").eq("transaction_id", req.transaction_id).eq("reviewer_id", current_user["id"]).execute()
    if existing_review.data:
        raise HTTPException(
            status_code=400,
            detail="You have already submitted a review for this transaction"
        )
        
    user_client = get_supabase_client(token)
    payload = {
        "transaction_id": req.transaction_id,
        "reviewer_id": current_user["id"],
        "reviewee_id": reviewee_id,
        "rating": req.rating,
        "comment": req.comment
    }
    
    try:
        res = user_client.table("reviews").insert(payload).execute()
        return res.data[0]
    except Exception as e:
        logger.error(f"Error submitting review: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/api/reviews/user/{user_id}")
def get_user_reviews(user_id: str):
    """
    Retrieves reviews received by a specific user (either farmer or consumer).
    """
    admin_client = get_admin_client()
    try:
        res = admin_client.table("reviews").select("*, profiles:reviewer_id(full_name, avatar_url)").eq("reviewee_id", user_id).order("created_at", desc=True).execute()
        return res.data or []
    except Exception as e:
        logger.error(f"Error fetching reviews: {e}")
        raise HTTPException(status_code=400, detail=str(e))
