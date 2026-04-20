import { useState } from 'react'
import Onboarding from '../../shared/Modals/OnboardingModal/Onboarding'
import { useNavigate } from 'react-router-dom'

const How = () => {
  //   const [showOnboarding, setShowOnboarding] = useState(() => {
  //     return !localStorage.getItem('onboarding_done')
  //   })

  const navigate = useNavigate()

  const [show, setShow] = useState(true)
  return (
    <div>
      {show && (
        <Onboarding
          onComplete={() => {
            localStorage.setItem('onboarding_done', 'true')
            setShow(false)
            navigate('/')
          }}
        />
      )}
    </div>
  )
}

export default How
