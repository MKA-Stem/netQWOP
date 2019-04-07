import firebase from "firebase";

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyBpLCC9-j_2GoozqU0XgViIb6wflispOzk",
    authDomain: "netqwop.firebaseapp.com",
    databaseURL: "https://netqwop.firebaseio.com",
    projectId: "netqwop",
    storageBucket: "netqwop.appspot.com",
    messagingSenderId: "896343202212"
  });
}

const { firestore } = firebase;
const db = firestore();

export async function addScore({ name, score }) {
  return db.collection("scores").add({
    name,
    score
  });
}

export async function getLeaderboard() {
  const scores = [];
  let i = 1;
  const querySnapshot = await db
    .collection("scores")
    .orderBy("score", "desc")
    .limit(5)
    .get();
  await querySnapshot.forEach(async doc => {
    scores.push({ ...(await doc.data()), i });
    i++;
  });
  scores.sort((a, b) => b.score - a.score);
  return scores;
}
