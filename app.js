import { auth, db } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  runTransaction,
  query,
  where,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

console.log("🔥 app.js is running");

// ✅ Use toki_users instead of users
onAuthStateChanged(auth, async user => {
  if (user) {
    document.getElementById("login").style.display = "none";
    document.getElementById("profile").style.display = "block";
    document.getElementById("user-email").innerText = user.email;

    const userDocRef = doc(db, "toki_users", user.uid);
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.exists()) {
      await setDoc(userDocRef, { toki: 0, email: user.email });
    }

    listenToBalance(user.uid);
  } else {
    document.getElementById("login").style.display = "block";
    document.getElementById("profile").style.display = "none";
  }
});

// ✅ Renamed to avoid browser conflicts
window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    alert(err.message);
  }
};


window.logout = function () {
  signOut(auth);
};

function listenToBalance(uid) {
  const userDoc = doc(db, "toki_users", uid);
  onSnapshot(userDoc, (docSnap) => {
    const data = docSnap.data();
    document.getElementById("balance").innerText = data?.toki || 0;
  });
}

window.completeTask = function () {
  const uid = auth.currentUser.uid;
  const userDoc = doc(db, "toki_users", uid);

  runTransaction(db, async (transaction) => {
    const docSnap = await transaction.get(userDoc);
    const newBalance = (docSnap.data()?.toki || 0) + 10;
    transaction.update(userDoc, { toki: newBalance });
  }).then(() => {
    alert("🎉 Task Completed! You earned 10 TOKI.");
  }).catch(err => {
    console.error("Error awarding TOKI:", err);
  });
};

window.approveTask = async function () {
  const approver = auth.currentUser;
  const otherUserInput = document.getElementById("other-user-id").value.trim();
  if (!otherUserInput) return alert("Enter UID or Email.");

  let otherUid = otherUserInput;

  if (otherUserInput.includes("@")) {
    const q = query(collection(db, "toki_users"), where("email", "==", otherUserInput));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return alert("User not found.");
    otherUid = snapshot.docs[0].id;
  }

  const approverRef = doc(db, "toki_users", approver.uid);
  const receiverRef = doc(db, "toki_users", otherUid);

  try {
    await runTransaction(db, async (transaction) => {
      const approverSnap = await transaction.get(approverRef);
      const receiverSnap = await transaction.get(receiverRef);

      const approverBalance = approverSnap.data()?.toki || 0;
      const receiverBalance = receiverSnap.data()?.toki || 0;
      const reward = 10;

      if (approverBalance < reward) throw new Error("Insufficient TOKI");

      transaction.update(approverRef, { toki: approverBalance - reward });
      transaction.update(receiverRef, { toki: receiverBalance + reward });
    });

    alert("✅ Task approved! TOKI transferred.");
  } catch (err) {
    console.error("❌ Transaction error:", err);
    alert("Error approving task: " + err.message);
  }
};
