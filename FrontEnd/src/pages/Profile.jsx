import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  clearUserData,
  fetchUserData,
  updateUserData,
  deleteUser,
} from "../store/profileSlice";
import { useTranslation } from "react-i18next";

const Profile = () => {
  const { t } = useTranslation();
  const { userData, loading, error } = useSelector((state) => state.profile);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userData.name || "",
    email: userData.email || "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (userData.id && !userData.name) {
      dispatch(fetchUserData(userData.id));
    } else if (!userData.id) {
      navigate("/login");
    }
  }, [dispatch, userData.id, navigate]);

  useEffect(() => {
    if (userData.name && userData.email) {
      setFormData({
        name: userData.name,
        email: userData.email,
      });
    }
  }, [userData.name, userData.email]);

  const handleLogout = () => {
    dispatch(clearUserData());
    navigate("/login");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userData.id) return;

    try {
      await dispatch(
        updateUserData({ userId: userData.id, userData: formData })
      ).unwrap();
      setIsEditing(false);
    } catch (err) {
      if (err.message === "Please login again") {
        navigate("/login");
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (!userData.id) return;

    if (window.confirm(t("deleteAccountConfirmation"))) {
      try {
        await dispatch(deleteUser(userData.id)).unwrap();
        navigate("/login");
      } catch (err) {
        if (err.message === "Please login again") {
          navigate("/login");
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold">{t("loading")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">
          {error.message || t("errorOccurred")}
        </div>
      </div>
    );
  }

  if (!userData.id || !userData.name) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold">{t("loading")}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-8 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">{t("profile")}</h1>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                {t("name")}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                {t("email")}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border rounded-md p-2"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? t("saving") : t("save")}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
              >
                {t("cancel")}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                {t("name")}
              </label>
              <p className="text-gray-600">{userData.name}</p>
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                {t("email")}
              </label>
              <p className="text-gray-600">{userData.email}</p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              {t("editProfile")}
            </button>
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
            >
              {t("logout")}
            </button>
            <button
              onClick={handleDeleteAccount}
              className="w-full bg-red-800 text-white py-2 px-4 rounded-md hover:bg-red-900 transition-colors"
            >
              {t("deleteAccount")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
