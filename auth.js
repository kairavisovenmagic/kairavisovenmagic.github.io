// auth.js — Firebase Auth utilities for Kairavi’s Oven Magic (ES module)

// ---------- Firebase imports ----------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getAuth, setPersistence, browserLocalPersistence,
  onAuthStateChanged, signOut,
  GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

// ---------- Your Firebase config ----------
export const firebaseConfig = {
  apiKey: "AIzaSyCk4rYYxGWI9XBLXiIR1uaIFAnf8WHZP2w",
  authDomain: "kairavis-oven-magic.firebaseapp.com",
  projectId: "kairavis-oven-magic",
  storageBucket: "kairavis-oven-magic.firebasestorage.app",
  messagingSenderId: "270897232759",
  appId: "1:270897232759:web:36ee0edc8b222046febf72"
};

// ---------- Init ----------
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

// ---------- Admin whitelist (edit if needed) ----------
export const ADMIN_EMAILS = ["kairavisovenmagic@gmail.com"];

// ---------- Tiny toast ----------
export function toast(msg) {
  let t = document.querySelector(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    Object.assign(t.style, {
      position:"fixed", left:"50%", bottom:"20px", transform:"translateX(-50%)",
      background:"#333", color:"#fff", padding:"10px 16px",
      borderRadius:"10px", opacity:"0", transition:"opacity .25s", zIndex:"9999"
    });
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = "1";
  setTimeout(() => { t.style.opacity = "0"; }, 1400);
}

// ---------- Header updater (Login/My Account/Admin + Logout) ----------
export function attachHeaderAuth() {
  const loginLink  = document.getElementById("loginLink");
  const logoutLink = document.getElementById("logoutLink");
  if (!loginLink) return;

  onAuthStateChanged(auth, (user) => {
    if (user) {
      const email = (user.email || "").toLowerCase();
      const isAdmin = ADMIN_EMAILS.includes(email);
      loginLink.textContent = isAdmin ? "Admin" : "My Account";
      loginLink.href       = isAdmin ? "admin.html" : "my-account.html";
      loginLink.title      = user.email || "";
      if (logoutLink) logoutLink.style.display = "";
    } else {
      loginLink.textContent = "Login";
      loginLink.href = "login.html";
      loginLink.removeAttribute("title");
      if (logoutLink) logoutLink.style.display = "none";
    }
  });

  if (logoutLink) {
    logoutLink.addEventListener("click", async (e) => {
      e.preventDefault();
      if (!confirm("Log out from Kairavi’s Oven Magic?")) return;
      try {
        await signOut(auth);
        toast("Logged out!");
        setTimeout(() => { window.location.href = "index.html"; }, 600);
      } catch (err) {
        alert("Logout failed: " + (err?.message || err));
      }
    });
  }
}

// ---------- Route guards ----------
export function requireAuth() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) return resolve(user);
      const next = "login.html?next=" + encodeURIComponent(location.pathname);
      window.location.href = next;
    });
  });
}

export function requireAdmin() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        const next = "login.html?next=" + encodeURIComponent(location.pathname);
        window.location.href = next;
        return;
      }
      const email = (user.email || "").toLowerCase();
      const isAdmin = ADMIN_EMAILS.includes(email);
      if (!isAdmin) {
        toast("Admin only");
        setTimeout(() => { window.location.href = "my-account.html"; }, 700);
        return;
      }
      resolve(user);
    });
  });
}

// ---------- Google sign-in (popup → redirect fallback) ----------
export async function signInWithGoogleFlow() {
  const provider = new GoogleAuthProvider();
  try {
    return await signInWithPopup(auth, provider);
  } catch (e) {
    const msg = (e?.message || "").toLowerCase();
    if (
      e?.code === "auth/popup-blocked" ||
      e?.code === "auth/cancelled-popup-request" ||
      msg.includes("popup")
    ) {
      return signInWithRedirect(auth, provider);
    }
    throw e;
  }
}

// Finish Google redirect if returning from Google (returns userCred or null)
export async function completeGoogleRedirectIfNeeded() {
  try {
    return await getRedirectResult(auth);
  } catch (e) {
    console.warn("Google redirect completion error:", e);
    return null;
  }
}

// ---------- Email/password helpers ----------
export async function emailPasswordSignIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}
export async function emailPasswordSignUp(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}
export async function requestPasswordReset(email) {
  return sendPasswordResetEmail(auth, email);
}
