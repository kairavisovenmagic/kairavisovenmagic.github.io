<script type="module">
// auth.js (module)

// ---- Firebase v10 modules ----
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getAuth, setPersistence, browserLocalPersistence,
  onAuthStateChanged, signOut,
  GoogleAuthProvider, signInWithPopup,
  signInWithEmailAndPassword, createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

// ---- Your Firebase Config (as provided) ----
export const firebaseConfig = {
  apiKey: "AIzaSyCk4rYYxGWI9XBLXiIR1uaIFAnf8WHZP2w",
  authDomain: "kairavis-oven-magic.firebaseapp.com",
  projectId: "kairavis-oven-magic",
  storageBucket: "kairavis-oven-magic.firebasestorage.app",
  messagingSenderId: "270897232759",
  appId: "1:270897232759:web:36ee0edc8b222046febf72"
};

// ---- Initialize app/auth once ----
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

// ---- Admin emails whitelist (edit as needed) ----
export const ADMIN_EMAILS = [
  "kairavisovenmagic@gmail.com"
];

// ---- Tiny toast ----
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
  setTimeout(()=> t.style.opacity = "0", 1400);
}

// ---- Header updater (Login/My Account/Admin + Logout) ----
export function attachHeaderAuth() {
  const loginLink = document.getElementById("loginLink");
  const logoutLink = document.getElementById("logoutLink");
  if (!loginLink) return;

  onAuthStateChanged(auth, (user) => {
    if (user) {
      const email = (user.email || "").toLowerCase();
      const isAdmin = ADMIN_EMAILS.includes(email);
      loginLink.textContent = isAdmin ? "Admin" : "My Account";
      loginLink.href = isAdmin ? "admin.html" : "my-account.html";
      loginLink.title = user.email;
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
        setTimeout(()=> window.location.href = "index.html", 600);
      } catch (err) {
        alert("Logout failed: " + (err?.message || err));
      }
    });
  }
}

// ---- Guards ----
export function requireAuth() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) resolve(user);
      else window.location.href = "login.html?next=" + encodeURIComponent(location.pathname);
    });
  });
}

export function requireAdmin() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = "login.html?next=" + encodeURIComponent(location.pathname);
        return;
      }
      const email = (user.email || "").toLowerCase();
      const isAdmin = ADMIN_EMAILS.includes(email);
      if (!isAdmin) {
        toast("Admin only");
        setTimeout(()=> window.location.href = "my-account.html", 800);
        return;
      }
      resolve(user);
    });
  });
}

// ---- Auth actions for login page ----
export async function signInWithGoogleFlow() {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}
export async function emailPasswordSignIn(email, pass) {
  return signInWithEmailAndPassword(auth, email, pass);
}
export async function emailPasswordSignUp(email, pass) {
  return createUserWithEmailAndPassword(auth, email, pass);
}
</script>
