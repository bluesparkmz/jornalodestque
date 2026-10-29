import Link from "next/link";
import { Logo } from "./logo";

const columns = [
  {
    title: "Mundo",
    links: ["Economia global", "Religião", "Bitcoin", "Conflitos", "Desporto", "Escândalos"],
  },
  {
    title: "Entretenimento",
    links: ["Celebridades", "Cinema", "TV", "Música", "Estilo de vida", "Vídeos"],
  },
  {
    title: "Saúde",
    links: ["Investigação médica", "Vida saudável", "Saúde mental", "Vírus", "Saúde infantil"],
  },
  {
    title: "Negócios",
    links: ["Mercados", "Tecnologia", "Reportagens", "Imobiliário", "Líderes"],
  },
];

function SocialSquare({ label, className, href }: { label: string; className: string; href: string }) {
  return (
    <a className={`footer-social ${className}`} href={href} target="_blank" rel="noreferrer" aria-label={label}>
      {label.slice(0, 1)}
    </a>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {columns.map((column) => (
              <div key={column.title} className="footer-col">
                <h4 className="footer-col__title">{column.title}</h4>
                <ul>
                  {column.links.map((link) => (
                    <li key={link}><Link href="/categorias">{link}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="footer-brand-row">
            <Logo light />
            <div className="footer-socials">
              <SocialSquare label="Facebook" className="is-facebook" href="https://facebook.com" />
              <SocialSquare label="Twitter" className="is-twitter" href="https://twitter.com" />
              <SocialSquare label="WhatsApp" className="is-whatsapp" href="https://wa.me" />
              <SocialSquare label="Telegram" className="is-telegram" href="https://t.me" />
              <SocialSquare label="LinkedIn" className="is-linkedin" href="https://linkedin.com" />
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom__inner">
          <div>
            <ul className="footer-legal">
              <li><Link href="/categorias">Contacte-nos</Link></li>
              <li><Link href="/categorias">Termos de uso</Link></li>
              <li><Link href="/categorias">Publicidade</Link></li>
              <li><Link href="/categorias">Sobre nós</Link></li>
              <li><Link href="/categorias">Newsletter</Link></li>
              <li><Link href="/categorias">Mapa do site</Link></li>
            </ul>
            <p className="footer-copy">Copyright © 2026 Jornal O Destaque. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
