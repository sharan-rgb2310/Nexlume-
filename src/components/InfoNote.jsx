import { Info } from 'lucide-react'

export default function InfoNote() {
  return (
    <aside className="info-note">
      <Info role="img" aria-label="Information" size={20} strokeWidth={2.5} />
      <div>
        <p lang="ta">* மாதிரித் தரவு மட்டுமே. உண்மையான இருப்பு, கையிருப்பு அமைப்பிலிருந்து பெறப்படும்.</p>
        <p>* Illustrative sample data only. Actual stock will be fetched from the inventory system.</p>
      </div>
    </aside>
  )
}
