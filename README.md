# Sistema de Contratação de Serviço de Perfuração

## Visão Geral

O projeto **Sistema de Contratação de Serviço de Perfuração** surgiu da necessidade de modernizar e otimizar o processo de contratação e gerenciamento de serviços de perfuração de poços. A motivação principal foi criar uma solução digital eficiente que facilite a comunicação entre clientes e a empresa prestadora de serviços, proporcionando maior transparência, rapidez e acessibilidade ao processo.

## Funcionalidades

O sistema atende às seguintes etapas do processo:

1. **Solicitação de Serviço:** O cliente informa os dados do local e as preferências de agendamento.
2. **Agendamento de Vistoria:** O supervisor de perfuração recebe a solicitação, organiza os detalhes e agenda uma vistoria.
3. **Decisão Após Vistoria:** O supervisor aprova ou rejeita o local e comunica a decisão ao cliente.
4. **Elaboração do Contrato:** Caso aprovado, o gerente de vendas elabora o contrato com base no feedback do supervisor e do cliente.
5. **Aprovação Final:** O cliente revisa e aprova o contrato ou solicita ajustes, encerrando o processo com a confirmação do serviço.

## Tecnologias Utilizadas

- **Frontend:** React, Next.js, Tailwind CSS, TypeScript
- **Backend:** Next.js API Routes
- **Banco de Dados:** PostgreSQL
- **Bibliotecas e Ferramentas Adicionais:**
  - jsPDF: Para geração de documentos em PDF.
  - html2canvas: Para captura de telas e integração com o jsPDF.
  - Signature Pad: Para captura de assinaturas digitais.
  - jsonwebtoken (JWT): Para autenticação segura.
  - js-cookie: Para gerenciamento de cookies.
  - Zod: Para validação de dados.

## Ambientes de Desenvolvimento

- **IDE/Editor de Código:** Visual Studio Code (VS Code)
- **Gerenciador de Pacotes:** Yarn
- **Servidor de Desenvolvimento:** Next.js integrado com Node.js
- **Banco de Dados:** PostgreSQL, configurado para conexão segura
- **Repositório:** [GitHub](https://github.com/natsalete/SW-Martins-Pocos)

## Estrutura do Projeto

1. **Página Inicial do Projeto:** Informativa e funcional para navegação.
2. **Formulário de Solicitação de Serviços:** Interface para clientes enviarem pedidos de serviço de perfuração.
3. **Painel do Cliente:** Para acompanhamento de solicitações realizadas.
4. **Painel do Gestor de Vendas:** Para gerenciamento de solicitações e envio de notificações via WhatsApp.
5. **Painel do Supervisor de Perfuração:** Para aprovação ou reprovação de vistorias e contratos.
6. **Seção de Contratos:** Controle de geração, edição, exclusão e assinatura digital de contratos.

## Marcos de Entrega

1. **Configuração do Ambiente:** Estrutura inicial do projeto e configuração do banco de dados.
2. **Desenvolvimento de Interfaces:** Criação das páginas principais (cliente, gestor, supervisor).
3. **Implementação do Backend:** Integração com PostgreSQL e criação de rotas para gerenciamento de dados.
4. **Sistema de Notificações:** Integração com WhatsApp para comunicação automática.
5. **Sistema de Contratos:** Geração de PDFs e assinatura digital.
6. **Autenticação:** Implementação com JWT para segurança.

## Como Executar o Projeto Localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/natsalete/SW-Martins-Pocos.git
   ```
2. Instale as dependências:
   ```bash
   yarn install
   ```
3. Configure as variáveis de ambiente no arquivo `.env`.
4. Execute o projeto:
   ```bash
   yarn dev
   ```
5. Acesse o sistema no navegador em `http://localhost:3000`.

## Contribuições

Contribuições são bem-vindas! Siga os passos abaixo:

1. Fork o repositório.
2. Crie uma branch para sua funcionalidade:
   ```bash
   git checkout -b minha-funcionalidade
   ```
3. Realize as alterações e faça o commit:
   ```bash
   git commit -m "Adiciona nova funcionalidade"
   ```
4. Envie suas alterações:
   ```bash
   git push origin minha-funcionalidade
   ```
5. Abra um Pull Request no repositório original.

## Autor

Desenvolvido por **Natália** na disciplina de Engenharia de Software III do curso de ADS, este projeto visa o aprendizado e a aplicação de tecnologias modernas em soluções empresariais.

## Licença

Este projeto está sob a licença MIT - consulte o arquivo LICENSE para mais detalhes.

---
