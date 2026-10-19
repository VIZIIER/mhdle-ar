import { mediaUrl, type Monster } from '../data';
import { useI18n } from '../i18n/I18nProvider';

const CLASS_HUE: Record<string, number> = {
  'flying-wyvern': 8, 'bird-wyvern': 34, 'brute-wyvern': 20, 'piscine-wyvern': 195, 'fanged-wyvern': 280,
  'snake-wyvern': 150, 'fanged-beast': 45, 'elder-dragon': 265, 'demi-elder': 300, leviathan: 210, amphibian: 120,
  carapaceon: 0, neopteron: 90, temnoceran: 330, cephalopod: 315, lynian: 60, relict: 100, construct: 230, unclassified: 0,
};

/**
 * The monster's icon if one is installed (public/media/icons/<id>.webp), otherwise a neutral
 * initial-letter token tinted by the monster's class. No artwork is drawn for monsters.
 */
export function MonsterBadge({ monster, size = 40 }: { monster: Monster; size?: number }) {
  const { lang } = useI18n();
  const icon = mediaUrl('icons', monster.id);
  if (icon) return <img className="badge badge-img" src={icon} alt="" width={size} height={size} loading="lazy" />;
  const hue = CLASS_HUE[monster.classes[0]] ?? 40;
  const letter = Array.from(monster.name[lang].replace(/^(ال)/, ''))[0] ?? '?';
  return (
    <span className="badge" aria-hidden="true" style={{ width: size, height: size, ['--hue' as string]: hue, fontSize: size * 0.45 }}>
      {letter}
    </span>
  );
}
