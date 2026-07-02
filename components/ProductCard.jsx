import Link from "next/link";
import Image from "next/image";

export default function ProductCard({ product, compact = false }) {
  const { id, nome, descricaoCurta, imagens, categoria, sku } = product;
  const imagem = imagens?.[0] || null;

  return (
    <Link href={`/produto/${id}`} className="card group hover:shadow-md transition-shadow duration-200 flex flex-col">
      <div className={`relative bg-gray-100 dark:bg-gray-800 overflow-hidden ${compact ? "aspect-[4/3]" : "aspect-square"}`}>
        {imagem ? (
          <Image
            src={imagem}
            alt={nome}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-600">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {categoria && (
          <span className="absolute top-3 left-3 bg-white/90 dark:bg-gray-800 backdrop-blur-sm text-xs font-semibold text-brand-700 dark:text-brand-200 px-2.5 py-1 rounded-full">
            {categoria}
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        {sku && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">SKU: {sku}</p>
        )}
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-snug mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
          {nome}
        </h3>
        {descricaoCurta && (
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mt-auto pt-2">
            {descricaoCurta}
          </p>
        )}
        <div className="mt-3 flex items-center text-brand-600 dark:text-brand-400 text-xs font-semibold">
          Ver detalhes
          <svg className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
