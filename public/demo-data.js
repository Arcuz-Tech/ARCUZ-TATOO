window.ARCUZ_DEMO_DATA = {
  categories: [
    ['Blackwork','blackwork','Para quem encontra força no contraste. Massas de preto, respiros e textura criam uma presença quase ritual, desenhada para acompanhar músculos, dobras e o modo como o corpo ocupa o espaço.'],
    ['Colorido','colorido','Para memórias e identidades que pedem intensidade. A paleta nasce do sentimento do projeto e é equilibrada com contraste, tom de pele e composição para continuar vibrante sem perder profundidade.'],
    ['Fine Line','fine-line','Delicadeza não é ausência de intenção. Linhas finas registram lembranças, vínculos e pequenos símbolos com silêncio visual, respeitando a escala e o envelhecimento natural de cada traço.'],
    ['Geométrico','geometrico','Ordem, repetição e equilíbrio para quem enxerga sentido nas estruturas. Cada eixo responde ao corpo, criando uma imagem precisa que muda sutilmente conforme você se move.'],
    ['Lettering','lettering','Palavras também têm corpo. Cada letra é construída a partir do tom da mensagem, da personalidade de quem a carrega e do lugar onde será lida — como voz transformada em traço.'],
    ['Minimalista','minimalista','Quando uma pequena forma consegue guardar uma história inteira. O essencial é desenhado com intenção, escala responsável e espaço suficiente para que o símbolo continue claro com o passar dos anos.'],
    ['Old School','old-school','Símbolos diretos para histórias que merecem ser ditas sem rodeios. Contorno firme, composição clara e cor marcante transformam coragem, saudade, liberdade e pertencimento em imagens feitas para durar.'],
    ['Oriental','oriental','Mais do que figuras isoladas, é uma narrativa que percorre o corpo. Movimento, vento, água e símbolos tradicionais se conectam em grandes composições guiadas pela anatomia e pelo significado de quem as veste.'],
    ['Realismo','realismo','Uma forma de manter perto um rosto, um instante ou algo que o tempo não deveria apagar. Luz, sombra e textura são reconstruídas para preservar expressão e profundidade sem perder a leitura na pele.']
  ].map(([name,slug,description],i)=>({id:i+1,name,slug,description})),
  works: [
    ['Silêncio Botânico','Fine Line','Ramos delicados construídos para acompanhar o movimento natural do braço.','https://images.pexels.com/photos/8258889/pexels-photo-8258889.jpeg?auto=compress&cs=tinysrgb&w=1400'],
    ['Guardião Noturno','Blackwork','Contraste denso, textura pontilhada e presença gráfica em grande escala.','https://images.pexels.com/photos/8349189/pexels-photo-8349189.jpeg?auto=compress&cs=tinysrgb&w=1400'],
    ['Memória em Pele','Realismo','Retrato criado em camadas suaves de cinza, preservando luz e expressão.','https://images.pexels.com/photos/28742943/pexels-photo-28742943.jpeg?auto=compress&cs=tinysrgb&w=1400'],
    ['Órbita','Geométrico','Geometria ritual e linhas de precisão em uma composição de movimento.','https://images.pexels.com/photos/4750247/pexels-photo-4750247.jpeg?auto=compress&cs=tinysrgb&w=1400'],
    ['Pulso Antigo','Old School','Leitura contemporânea de símbolos clássicos, com traço firme e cor contida.','https://images.pexels.com/photos/2126124/pexels-photo-2126124.jpeg?auto=compress&cs=tinysrgb&w=1400'],
    ['Entrelinhas','Lettering','Lettering desenhado exclusivamente para a anatomia e a história da cliente.','https://images.pexels.com/photos/10710995/pexels-photo-10710995.jpeg?auto=compress&cs=tinysrgb&w=1400'],
    ['Linha de Horizonte','Minimalista','Um único gesto acompanha o pulso sem disputar atenção com a anatomia.','https://images.pexels.com/photos/16626427/pexels-photo-16626427.jpeg?auto=compress&cs=tinysrgb&w=1400'],
    ['Jardim Elétrico','Colorido','Paleta vibrante e contraste definido para manter leitura e energia sobre a pele.','https://images.pexels.com/photos/12038943/pexels-photo-12038943.jpeg?auto=compress&cs=tinysrgb&w=1400'],
    ['Fluxo do Vento','Oriental','Movimento contínuo e composição vertical guiada pelo eixo natural do braço.','https://images.pexels.com/photos/6503747/pexels-photo-6503747.jpeg?auto=compress&cs=tinysrgb&w=1400']
  ].map(([title,category,description,cover],i)=>({id:i+1,title,category,description,cover,work_date:'Acervo'})),
  artists: [
    {id:1,name:'Rafael Arcuz',role:'Direção artística · Tatuador',specialties:'Blackwork · Geométrico · Grandes projetos',bio:'Constrói peças de alto contraste a partir do movimento, da musculatura e dos espaços de silêncio da pele.',image_url:'https://images.pexels.com/photos/3914562/pexels-photo-3914562.jpeg?auto=compress&cs=tinysrgb&w=1200',signature:'A pele não é suporte. É parte do desenho.'},
    {id:2,name:'Lia Nascimento',role:'Tatuadora residente',specialties:'Fine Line · Botânico · Lettering',bio:'Pesquisa delicadeza sem fragilidade: linhas leves, desenho botânico e letras criadas para acompanhar o corpo.',image_url:'https://images.pexels.com/photos/4123895/pexels-photo-4123895.jpeg?auto=compress&cs=tinysrgb&w=1200',signature:'Precisão também pode ser afeto.'},
    {id:3,name:'Caio Moura',role:'Tatuador residente',specialties:'Realismo · Preto e cinza',bio:'Trabalha memória, retrato e textura em composições de luz controlada e leitura duradoura.',image_url:'https://images.pexels.com/photos/28991541/pexels-photo-28991541.jpeg?auto=compress&cs=tinysrgb&w=1200',signature:'Cada sombra precisa ter motivo.'}
  ],
  settings: {whatsapp:'5511999999999',instagram:'@arcuz.tattoo',address:'Endereço demonstrativo — São Paulo, SP'}
};
