import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight, HelpCircle, LayoutDashboard, QrCode } from 'lucide-react';


interface SidebarProps {
    collapsed?: boolean;
    onToggle?: () => void;
}

const SideBar: React.FC<SidebarProps> = ({collapsed = false, onToggle}) => {
    const location = useLocation();
    const menuItems = [
        {
            title: 'Tableau de bord',
            icon: LayoutDashboard,
            path: '/Polls',
            badge: null
        },

        {
            title: 'Aide & Support',
            icon: HelpCircle,
            path: '/help',
            badge: null
        },
    ]



  return (
    <aside className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-400 transition-all duration-300 z-40 flex flex-col
    ${collapsed ? 'w-20' : 'w-64'} `}>

        {/*Logo et ou titre */}
        <div className='p-6 border-b border-gray-200'>
            <div className='flex items-center justify-between'>
                {!collapsed && (
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-linear-to-br from-fne-primary to-fne-primary-light flex items-center justify-center">
                            <QrCode className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Back-Office</h1>
                            <p className="text-xs text-gray-500">Version 1.0.0</p>
                        </div>
                    </div>
                )}

                {collapsed && (
                    <div className='w-10 h-10 rounded-lg bg-linear-to-br from-fne-primary to-fne-primary-light flex items-center justify-center mx-auto'>
                        <QrCode className='w-6 h-6 text-white' />
                    </div>
                )}

                <button onClick={onToggle} className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label={collapsed ? "Étendre le menu" : "Réduire le menu"}>

                    {collapsed ? ( <ChevronRight className="w-5 h-5 text-gray-500" /> ) : ( <ChevronLeft className="w-5 h-5 text-gray-500" /> )}
                
                </button>
            </div>
        </div>


        {/* Menu Principal */}
        <nav className='flex-1 p-4 overflow-y-auto'>
            <div className='gap-y-1.5'>
                <p className={`text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 ${collapsed ? 'hidden' : 'block'}`}>
                     Navigation
                </p>

                {menuItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path)

                    return(
                        <NavLink key={item.path} to={item.path}
                          className={({isActive})=> `flex items-center rounded-xl px-4 py-3 my-1.5 transition-all duration-200
                            ${isActive ? 'bg-linear-to-r from-fne-primary/10 to-transparent border-l-4 border-fne-primary text-fne-primary' 
                            : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                            } ${collapsed ? 'justify-center' : ''}`}
                                title={collapsed ? item.title : undefined}
                            >

                                <item.icon className={`w-5 h-5 ${isActive ? 'text-xl font-bold' : 'text-gray-400'}`}/>

                                {!collapsed && (
                                    <>
                                      <span className="ml-3 font-medium">{item.title}</span>
                    
                                        {item.badge && ( <span className={` ml-auto px-2 py-1 text-xs font-semibold rounded-full
                                            ${item.badge === '!' ? 'bg-fne-warning/20 text-fne-warning' : 'bg-gray-200 text-gray-700'
                                        } `}>
                    
                                                {item.badge}
                                            </span>
                                        )}
                                    </>
                                )}

                        </NavLink>
                    )
                })}
            </div>

        </nav>

    </aside>
  )
}

export default SideBar