// extractor.js — Omega: extrator de CRLV via API Claude (reutilizavel)
(function(){

  window.OmegaExtractor = {

    // Envia arquivo para a API e retorna os dados extraidos
    extrair: function(file, onSuccess, onError) {
      var apiKey = window.OmegaUtils.getApiKey();
      if(!apiKey) {
        onError('Chave API nao configurada. Clique no icone de configuracao.');
        return;
      }

      var reader = new FileReader();
      reader.onload = function(e) {
        var base64 = e.target.result.split(',')[1];
        var mediaType = file.type === 'application/pdf' ? 'application/pdf' : file.type;

        var body = {
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 300,
          messages: [{
            role: 'user',
            content: [{
              type: file.type === 'application/pdf' ? 'document' : 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 }
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
        .then(function(r){ return r.json(); })
        .then(function(data){
          if(data.error) { onError('API: '+data.error.message); return; }
          var texto = data.content && data.content[0] ? data.content[0].text.trim() : '';
          var resultado = {};
          texto.split('|').forEach(function(par){
            var partes = par.split('=');
            if(partes.length === 2) resultado[partes[0].trim()] = partes[1].trim();
          });
          if(!resultado.placa && !resultado.renavam) { onError('Nao foi possivel extrair os dados. Verifique o documento.'); return; }
          onSuccess(resultado);
        })
        .catch(function(err){ onError('Erro de conexao: '+err.message); });
      };
      reader.readAsDataURL(file);
    }
  };

})();
