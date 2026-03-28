// extractor.js — Omega: extrator de CRLV via API Claude (v57 — refatorado)
(function(){

  var TIPOS_ACEITOS = ['application/pdf','image/jpeg','image/png','image/webp','image/gif'];

  window.OmegaExtractor = {

    extrair: function(file, onSuccess, onError) {
      var apiKey = window.OmegaUtils.getApiKey();
      if(!apiKey) {
        onError('Chave API nao configurada. Clique em "Chave API".');
        return;
      }

      // Valida tipo de arquivo
      if(TIPOS_ACEITOS.indexOf(file.type) === -1) {
        onError('Tipo de arquivo nao suportado: ' + (file.type || 'desconhecido') + '. Use PDF ou imagem.');
        return;
      }

      // Valida tamanho (max 20MB para a API)
      if(file.size > 20 * 1024 * 1024) {
        onError('Arquivo muito grande (max 20MB). Tamanho: ' + Math.round(file.size/1024/1024) + 'MB.');
        return;
      }

      var reader = new FileReader();
      reader.onerror = function(){ onError('Erro ao ler o arquivo.'); };
      reader.onload = function(e) {
        var base64 = e.target.result.split(',')[1];
        if(!base64) { onError('Erro ao converter arquivo para base64.'); return; }

        var isPDF = file.type === 'application/pdf';

        var body = {
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 300,
          messages: [{
            role: 'user',
            content: [{
              type: isPDF ? 'document' : 'image',
              source: { type: 'base64', media_type: file.type, data: base64 }
            },{
              type: 'text',
              text: 'Extraia do CRLV exatamente estes 4 campos e retorne SOMENTE neste formato sem mais nada:\nplaca=VALOR|renavam=VALOR|cpf=VALOR|nome=VALOR\n\nRegras:\n- placa: apenas letras e numeros sem traco\n- renavam: apenas numeros\n- cpf: apenas numeros sem pontos ou traco\n- nome: nome completo em maiusculas\n- Se nao encontrar algum campo, coloque vazio'
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
          if(!r.ok && r.status === 401){
            onError('Chave API invalida. Verifique em "Chave API".');
            return null;
          }
          if(!r.ok && r.status === 429){
            onError('Limite de requisicoes excedido. Aguarde e tente novamente.');
            return null;
          }
          return r.json();
        })
        .then(function(data){
          if(!data) return; // ja tratado acima
          if(data.error) { onError('API: ' + data.error.message); return; }
          var texto = data.content && data.content[0] ? data.content[0].text.trim() : '';
          var resultado = window.OmegaUtils.parseCodigo(texto);
          if(!resultado.placa && !resultado.renavam) {
            onError('Nao foi possivel extrair os dados. Verifique se o documento e um CRLV legivel.');
            return;
          }
          onSuccess(resultado);
        })
        .catch(function(err){ onError('Erro de conexao: ' + err.message); });
      };
      reader.readAsDataURL(file);
    }
  };

})();
