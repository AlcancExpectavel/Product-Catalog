/**
 * Importa um produto para o Firestore.
 * Requer: npm run dev a correr
 * Corre com: node produto_importar.mjs
 */

const produto = {
  sku: "SKUAD7860",
  adamantaUrl: "https://trade.adamanta.eu/product/adler-thermo-electric-dehumidifier-sku-ad-7860/",
  nome: "Desumidificador Termoelétrico Adler AD 7860",

  descricaoCurta:
    "Desumidificador termoelétrico silencioso com tecnologia de célula Peltier, ecrã LED com indicador de humidade em 3 cores, 3 modos de funcionamento, reservatório de 1000 ml e capacidade de extração de 500 ml/24h. Ideal para casas de banho e espaços até 30 m³.",

  descricao:
    "O Desumidificador Termoelétrico Adler AD 7860 combina funcionalidade com um design elegante e compacto. Equipado com sensor de humidade e sensor de reservatório cheio, desliga-se automaticamente quando o depósito atinge a capacidade máxima, tornando a utilização intuitiva e segura - mesmo durante a noite.\n\nO ecrã LED indica em tempo real a humidade do ambiente através de três cores: vermelho para humidade igual ou superior a 80%, verde entre 71% e 79%, e azul para humidade igual ou inferior a 70%. Com três modos de funcionamento (automático, contínuo e noturno) e dois níveis de ventilação, adapta-se facilmente às condições de cada espaço. Previne o aparecimento de bolor e elimina odores desagradáveis, com um nível de ruído de apenas 35 dB(A).",

  caracteristicas: [
    "Tecnologia termoelétrica de célula Peltier: silenciosa e sem compressor",
    "Ecrã LED com indicador de humidade em 3 cores (vermelho, verde e azul)",
    "Sensor de humidade e sensor de reservatório cheio com desligamento automático",
    "3 modos de funcionamento: automático, contínuo e noturno",
    "2 velocidades de ventilação para maior controlo",
    "Reservatório de 1000 ml com tubo de drenagem contínua de 150 cm incluído",
    "Capacidade de extração: 500 ml/24h; caudal de ar: 40 m³/h",
    "Funcionamento silencioso: apenas 35 dB(A)",
    "Previne o crescimento de bolor e elimina odores desagradáveis",
    "Cabo de alimentação de 170 cm",
  ],

  inclui: [
    "1 x Desumidificador termoelétrico Adler AD 7860",
    "1 x Tubo de drenagem de 150 cm para funcionamento contínuo",
  ],

  perfeitoPara: [
    "Casas de banho e espaços pequenos até 30 m³",
    "Quartos onde é necessário funcionamento silencioso durante a noite",
    "Armários, caves e zonas com tendência para humidade e bolor",
    "Uso contínuo sem necessidade de esvaziamento manual do reservatório",
  ],

  parametrosTecnicos: [
    "Tecnologia: célula Peltier (termoelétrico)",
    "Potência: 90W (máx. 150W)",
    "Alimentação: 220-240V / 50Hz",
    "Capacidade de extração: 500 ml/24h",
    "Caudal de ar: 40 m³/h",
    "Área de funcionamento: até 30 m³",
    "Reservatório: 1000 ml",
    "Nível de ruído: 35 dB(A)",
    "Dimensões: 20,5 x 11,5 x 31 cm",
    "Peso: 2,08 kg",
    "Ficha: tipo C 16A/250V",
    "Material da caixa: plástico ABS",
  ],

  dimensoes: [
    "Dimensões do produto: 20,5 x 11,5 x 31 cm",
  ],

  crossells: [],
};

const res = await fetch("http://localhost:3000/api/guardar-produto", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ produto }),
});

const json = await res.json();

if (!res.ok || json.erro) {
  console.error("❌ Erro:", json.erro || res.status);
  process.exit(1);
}

console.log(`✅ ${produto.sku} adicionado ao Firestore!`);
console.log("   ID:", json.id);
console.log("   Imagens carregadas:", json.imagens, `(fonte: ${json.fonte})`);
