import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "./firebase";

const COLECAO = "produtos";

export async function getProdutos(categoria = null) {
  let q;
  if (categoria) {
    q = query(
      collection(db, COLECAO),
      where("categoria", "==", categoria),
      orderBy("nome")
    );
  } else {
    q = query(collection(db, COLECAO), orderBy("nome"));
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getProduto(id) {
  const snap = await getDoc(doc(db, COLECAO, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getCategorias() {
  const snap = await getDocs(query(collection(db, "categorias"), orderBy("nome")));
  return snap.docs.map((d) => d.data().nome);
}

export async function criarCategoria(nome) {
  const nomeTrim = nome.trim();
  if (!nomeTrim) return;
  const snap = await getDocs(query(collection(db, "categorias"), where("nome", "==", nomeTrim)));
  if (!snap.empty) return;
  await addDoc(collection(db, "categorias"), {
    nome: nomeTrim,
    criadaEm: serverTimestamp(),
  });
}

export async function removerCategoria(nome) {
  const snap = await getDocs(query(collection(db, "categorias"), where("nome", "==", nome)));
  for (const d of snap.docs) await deleteDoc(d.ref);
}

export async function criarProduto(dados) {
  return addDoc(collection(db, COLECAO), {
    ...dados,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });
}

export async function atualizarProduto(id, dados) {
  await updateDoc(doc(db, COLECAO, id), {
    ...dados,
    atualizadoEm: serverTimestamp(),
  });
}

export async function removerProduto(id, imagens = []) {
  for (const url of imagens) {
    try {
      const imgRef = ref(storage, url);
      await deleteObject(imgRef);
    } catch {
      // ignora imagens já removidas
    }
  }
  await deleteDoc(doc(db, COLECAO, id));
}

export async function uploadImagem(ficheiro, produtoId) {
  const extensao = ficheiro.name.split(".").pop();
  const caminho = `produtos/${produtoId}/${Date.now()}.${extensao}`;
  const storageRef = ref(storage, caminho);
  const snap = await uploadBytes(storageRef, ficheiro);
  return getDownloadURL(snap.ref);
}
