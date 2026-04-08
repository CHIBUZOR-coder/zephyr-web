
import Navbar from '../Navigation/Navbar'

type LayoutProps = React.PropsWithChildren

const Layout = ({ children }: LayoutProps) => {

  return (
    <div className='lay'>
      <Navbar
 
      />
      {children}
    </div>
  )
}

export default Layout
