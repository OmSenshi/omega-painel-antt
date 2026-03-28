// extractor.js — Omega: extrator de documentos via API Claude (v59 — multi-tipo)
(function(){

  var TIPOS_ACEITOS = ['application/pdf','image/jpeg','image/png','image/webp','image/gif'];

  // ── Prompts por tipo de documento ───────────────────────────────
  var PROMPTS = {
    crlv: {
      texto: 'Extraia do CRLV exatamente estes 4 campos e retorne SOMENTE neste formato sem mais nada:\nplaca=VALOR|renavam=VALOR|cpf=VALOR|nome=VALOR\n\nRegras:\n- placa: apenas letras e numeros sem traco\n- renavam: apenas numeros\n- cpf: apenas numeros sem pontos ou traco\n- nome: nome completo em maiusculas\n- Se nao encontrar algum campo, coloque vazio',
      validar: function(r){ return !!(r.placa || r.renavam); },
      erroMsg: 'Nao foi possivel extrair. Verifique se o documento e um CRLV legivel.'
    },
    cnh: {
      texto: 'Extraia deste documento (CNH, CNH-e, CNH Digital ou RG) exatamente estes 2 campos e retorne SOMENTE neste formato sem mais nada:\nidentidade=VALOR|uf=VALOR\n\nRegras:\n- identidade: numero do RG ou numero de registro da CNH, apenas numeros e letras sem pontos tracos ou espacos. Se for CNH use o numero de registro. Se for RG use o numero do RG.\n- uf: UF/estado emissor, apenas a sigla em maiusculas (2 letras)\n- Se nao encontrar algum campo, coloque vazio',
      validar: function(r){ return !!(r.identidade || r.uf); },
      erroMsg: 'Nao foi possivel extrair identidade/UF. Verifique se o documento e uma CNH ou RG legivel.'
    },
    endereco: {
      texto: 'Extraia deste comprovante de endereco exatamente estes 5 campos e retorne SOMENTE neste formato sem mais nada:\ncep=VALOR|logradouro=VALOR|numero=VALOR|bairro=VALOR|complemento=VALOR\n\nRegras:\n- cep: apenas 8 numeros sem traco\n- logradouro: nome da rua/avenida em maiusculas. Se nao encontrar use 0\n- numero: numero do imovel. Se nao encontrar use 0\n- bairro: nome do bairro em maiusculas. Se nao encontrar use 0\n- complemento: apto/bloco etc. Se nao encontrar deixe vazio\n- Se nao encontrar o cep, coloque vazio',
      validar: function(r){ return !!(r.cep || r.logradouro); },
      erroMsg: 'Nao foi possivel extrair endereco. Verifique se o documento e um comprovante legivel.'
    },
    cnpj: {
      texto: 'Extraia deste documento de inscricao CNPJ (pode ser CCMEI, cartao CNPJ, comprovante de inscricao) exatamente estes 5 campos e retorne SOMENTE neste formato sem mais nada:\ncep=VALOR|logradouro=VALOR|numero=VALOR|bairro=VALOR|complemento=VALOR|telefone=VALOR|email=VALOR\n\nRegras:\n- cep: apenas 8 numeros sem traco. Se nao encontrar coloque vazio\n- logradouro: nome da rua em maiusculas. Se nao encontrar use 0\n- numero: numero do imovel. Se nao encontrar use 0\n- bairro: nome do bairro em maiusculas. Se nao encontrar use 0\n- complemento: se nao encontrar deixe vazio\n- telefone: apenas numeros (DDD+numero, 10 ou 11 digitos). Se nao encontrar ou se parecer telefone de contador/terceiro coloque vazio\n- email: email do titular. Se nao encontrar ou se parecer email de contador/terceiro coloque vazio',
      validar: function(r){ return !!(r.cep || r.logradouro || r.telefone || r.email); },
      erroMsg: 'Nao foi possivel extrair dados do CNPJ. Verifique se o documento e legivel.'
    },
    cpf_socio: {
      texto: 'Extraia deste documento (CNH, CNH-e, CNH Digital ou RG) exatamente este campo e retorne SOMENTE neste formato sem mais nada:\ncpf_socio=VALOR\n\nRegras:\n- cpf_socio: CPF do titular do documento, apenas 11 numeros sem pontos ou traco\n- Se nao encontrar, coloque vazio',
      validar: function(r){ return !!r.cpf_socio; },
      erroMsg: 'Nao foi possivel extrair o CPF. Verifique se o documento e uma CNH ou RG legivel.'
    }
  };

  // ── Funcao principal de extracao ─────────────────────────────────
  function extrairDocumento(file, tipoPrompt, onSuccess, onError) {
    var apiKey = window.OmegaUtils.getApiKey();
    if(!apiKey) {
      onError('Chave API nao configurada. Clique em "Chave API".');
      return;
    }
    if(TIPOS_ACEITOS.indexOf(file.type) === -1) {
      onError('Tipo nao suportado: ' + (file.type || '?') + '. Use PDF ou imagem.');
      return;
    }
    if(file.size > 20 * 1024 * 1024) {
      onError('Arquivo muito grande (max 20MB).');
      return;
    }

    var prompt = PROMPTS[tipoPrompt];
    if(!prompt) { onError('Tipo de extracao desconhecido: ' + tipoPrompt); return; }

    var reader = new FileReader();
    reader.onerror = function(){ onError('Erro ao ler o arquivo.'); };
    reader.onload = function(e) {
      var base64 = e.target.result.split(',')[1];
      if(!base64) { onError('Erro ao converter para base64.'); return; }

      var body = {
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        messages: [{
          role: 'user',
          content: [{
            type: file.type === 'application/pdf' ? 'document' : 'image',
            source: { type: 'base64', media_type: file.type, data: base64 }
          },{
            type: 'text',
            text: prompt.texto
          }]
        }]
      };

      fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify(body)
      })
      .then(function(r){
        if(!r.ok && r.status === 401){ onError('Chave API invalida.'); return null; }
        if(!r.ok && r.status === 429){ onError('Limite de requisicoes. Aguarde.'); return null; }
        if(!r.ok){ onError('Erro HTTP ' + r.status); return null; }
        return r.json();
      })
      .then(function(data){
        if(!data) return;
        if(data.error) { onError('API: ' + data.error.message); return; }
        var texto = data.content && data.content[0] ? data.content[0].text.trim() : '';
        var resultado = window.OmegaUtils.parseCodigo(texto);
        if(!prompt.validar(resultado)) { onError(prompt.erroMsg); return; }
        onSuccess(resultado);
      })
      .catch(function(err){ onError('Erro de conexao: ' + err.message); });
    };
    reader.readAsDataURL(file);
  }

  // ── API publica ─────────────────────────────────────────────────
  window.OmegaExtractor = {
    // Retrocompativel — extrai CRLV (usado no arrendamento.js)
    extrair: function(file, onSuccess, onError) {
      extrairDocumento(file, 'crlv', onSuccess, onError);
    },
    // Novos tipos — usados no cadastro.js
    extrairCNH: function(file, onSuccess, onError) {
      extrairDocumento(file, 'cnh', onSuccess, onError);
    },
    extrairEndereco: function(file, onSuccess, onError) {
      extrairDocumento(file, 'endereco', onSuccess, onError);
    },
    extrairCNPJ: function(file, onSuccess, onError) {
      extrairDocumento(file, 'cnpj', onSuccess, onError);
    },
    extrairCPFSocio: function(file, onSuccess, onError) {
      extrairDocumento(file, 'cpf_socio', onSuccess, onError);
    }
  };

})();
