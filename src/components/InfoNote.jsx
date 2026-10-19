import { Info } from 'lucide-react'

export default function InfoNote() {
  return (
    <aside className="info-note">
      <Info role="img" aria-label="Information" size={20} strokeWidth={2.5} />
      <div>
        <p lang="ta">* மஉண்மையான இருப்பு விவரங்கள் சரக்கு மேலாண்மை அமைப்பிலிருந்து பெறப்படுகின்றன.</p>
        <p>* Actual stocks are fetched from the inventory system.</p>
      </div>
    </aside>
  )
}
