// =======================================================
// FUNÇÕES DE ACESSO A PRODUTOS — Firestore
// =======================================================

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

// ─── Leitura ───────────────────────────────────────────

/** Devolve todos os produtos, ordenados por nome */
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

/** Devolve um único produto por ID */
export async function getProduto(id) {
  const snap = await getDoc(doc(db, COLECAO, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/** Devolve lista de categorias da coleção dedicada */
export async function getCategorias() {
  const snap = await getDocs(query(collection(db, "categorias"), orderBy("nome")));
  return snap.docs.map((d) => d.data().nome);
}

/** Cria uma nova categoria (se ainda não existir) */
export async function criarCategoria(nome) {
  const nomeTrim = nome.trim();
  if (!nomeTrim) return;
  // Verifica se já existe
  const snap = await getDocs(query(collection(db, "categorias"), where("nome", "==", nomeTrim)));
  if (!snap.empty) return;
  await addDoc(collection(db, "categorias"), {
    nome: nomeTrim,
    criadaEm: serverTimestamp(),
  });
}

/** Remove uma categoria */
export async function removerCategoria(nome) {
  const snap = await getDocs(query(collection(db, "categorias"), where("nome", "==", nome)));
  for (const d of snap.docs) await deleteDoc(d.ref);
}

// ─── Escrita (admin) ───────────────────────────────────

/** Cria um novo produto */
export async function criarProduto(dados) {
  return addDoc(collection(db, COLECAO), {
    ...dados,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });
}

/** Atualiza um produto existente */
export async function atualizarProduto(id, dados) {
  await updateDoc(doc(db, COLECAO, id), {
    ...dados,
    atualizadoEm: serverTimestamp(),
  });
}

/** Remove um produto e as suas imagens do Storage */
export async function removerProduto(id, imagens = []) {
  // Remove imagens do Storage
  for (const url of imagens) {
    try {
      const imgRef = ref(storage, url);
      await deleteObject(imgRef);
    } catch {
      // Ignora erros de imagens já removidas
    }
  }
  await deleteDoc(doc(db, COLECAO, id));
}

// ─── Upload de imagens ─────────────────────────────────

/**
 * Faz upload de uma imagem e devolve o URL de download.
 * @param {File} ficheiro
 * @param {string} produtoId — usado para organizar no Storage
 */
export async function uploadImagem(ficheiro, produtoId) {
  const extensao = ficheiro.name.split(".").pop();
  const caminho = `produtos/${produtoId}/${Date.now()}.${extensao}`;
  const storageRef = ref(storage, caminho);
  const snap = await uploadBytes(storageRef, ficheiro);
  return getDownloadURL(snap.ref);
}
