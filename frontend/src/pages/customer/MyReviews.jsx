import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import api from "../../services/api";
import { MessageSquare, Star, Package } from "lucide-react";
import Breadcrumbs from "../../components/common/Breadcrumbs";

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const fetchMyReviews = async () => {
    try {
      const res = await api.get("/reviews/my-reviews");
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1f2328] font-sans">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Breadcrumbs>
          <Breadcrumbs.Item to="/">Home</Breadcrumbs.Item>
          <Breadcrumbs.Divider />
          <Breadcrumbs.Item active>My Reviews</Breadcrumbs.Item>
        </Breadcrumbs>

        <h1 className="text-2xl font-black mb-8 flex items-center gap-3 text-[#1f2328] mt-4">
          <MessageSquare className="text-[#0969da]" size={28} /> My Reviews
        </h1>

        {loading ? (
          <p className="text-[#6e7781] text-sm font-medium py-10">
            Loading your reviews...
          </p>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 bg-[#f6f8fa] rounded-xl border border-dashed border-[#d0d7de]">
            <MessageSquare size={48} className="mx-auto text-[#afb8c1] mb-4" />
            <p className="text-[#6e7781] font-medium">
              You haven't written any reviews yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.review_id}
                className="bg-white p-6 rounded-lg shadow-sm border border-[#d0d7de]"
              >
                <div className="flex items-start gap-4 mb-4 pb-4 border-b border-[#f0f2f4]">
                  <div className="w-16 h-16 bg-[#f6f8fa] border border-[#d0d7de] rounded overflow-hidden shrink-0 flex items-center justify-center">
                    {review.product_image ? (
                      <img
                        src={review.product_image}
                        alt={review.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package size={24} className="text-[#afb8c1]" />
                    )}
                  </div>
                  <div>
                    <Link
                      to={`/product/${review.product_id}`}
                      className="font-bold text-base hover:text-[#0969da] hover:underline"
                    >
                      {review.product_name}
                    </Link>
                    <p className="text-xs text-[#6e7781] mt-1">
                      Reviewed on {review.created_at}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex text-[#0969da]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < review.rating ? "currentColor" : "none"}
                        strokeWidth={i < review.rating ? 0 : 2}
                        className={i >= review.rating ? "text-[#d0d7de]" : ""}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-[#1f2328] leading-relaxed">
                    "{review.content}"
                  </p>
                  {review.is_fake && (
                    <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded w-fit">
                      Flagged as inappropriate
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyReviews;
