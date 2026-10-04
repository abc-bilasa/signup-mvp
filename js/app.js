import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./config.js";

const elements = {
  loginView: document.querySelector("#loginView"),
  signedView: document.querySelector("#signedView"),
  form: document.querySelector("#loginForm"),
  email: document.querySelector("#email"),
  submit: document.querySelector("#submitBtn"),
  status: document.querySelector("#status"),
  signedEmail: document.querySelector("#signedEmail"),
  signOut: document.querySelector("#signOutBtn"),
};

const isConfigured =
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("YOUR_PROJECT_REF") &&
  SUPABASE_PUBLISHABLE_KEY.length > 20 &&
  !SUPABASE_PUBLISHABLE_KEY.includes("YOUR_SUPABASE_");

let supabase = null;

function setStatus(message, type = "success") {
  elements.status.textContent = message;
  elements.status.className = `status is-visible is-${type}`;
}

function clearStatus() {
  elements.status.textContent = "";
  elements.status.className = "status";
}

function renderSession(user) {
  elements.loginView.hidden = Boolean(user);
  elements.signedView.hidden = !user;
  if (user) {
    elements.signedEmail.textContent = user.email
      ? `Signed in as ${user.email}.`
      : "Your account is signed in.";
  }
}

function setSubmitting(isSubmitting) {
  elements.submit.disabled = isSubmitting;
  elements.submit.querySelector(".button-label").textContent =
    isSubmitting ? "Sending link…" : "Email me a magic link";
}

async function initializeAuth() {
  if (!isConfigured) {
    setStatus("Add your Supabase URL and publishable/anon key in js/config.js to enable sign-in.", "error");
    return;
  }

  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    renderSession(data.session?.user ?? null);

    supabase.auth.onAuthStateChange((_event, session) => {
      renderSession(session?.user ?? null);
    });
  } catch (error) {
    setStatus(error.message || "Unable to initialize authentication.", "error");
  }
}

elements.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearStatus();

  if (!supabase) {
    setStatus("Authentication is not configured yet. Update js/config.js first.", "error");
    return;
  }

  const email = elements.email.value.trim();
  if (!email) {
    setStatus("Enter a valid email address.", "error");
    return;
  }

  setSubmitting(true);
  try {
    const redirectTo = `${window.location.origin}${window.location.pathname}`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) throw error;

    // Keep the message neutral to avoid disclosing whether an account exists.
    setStatus("If this email is eligible to sign in, a magic link is on its way. Check your inbox.");
  } catch (error) {
    setStatus(error.message || "Could not send the sign-in link. Please try again.", "error");
  } finally {
    setSubmitting(false);
  }
});

elements.signOut.addEventListener("click", async () => {
  if (!supabase) return;
  elements.signOut.disabled = true;
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    clearStatus();
    renderSession(null);
  } catch (error) {
    setStatus(error.message || "Could not sign out. Please try again.", "error");
  } finally {
    elements.signOut.disabled = false;
  }
});

initializeAuth();
