'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FEATURES, FEATURE_CATEGORIES } from '@/constants/features'
import { ImageMarkLogo as Logo } from '@/components/common'
import { cn } from '@/lib/utils'

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({})
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (pathname === '/' && path === '/watermark') return false // Home page is not watermark
    if (pathname === path) return true
    if (path !== '/' && pathname.startsWith(path)) return true
    return false
  }

  const NavLinks = () => {
    // Get enabled features for direct nav
    const enabledFeatures = FEATURES.filter((f) => f.enabled)

    return (
      <>
        {/* Enabled features - direct links */}
        {enabledFeatures.map((feature) => {
          const active = isActive(feature.path)

          return (
            <Link
              key={feature.id}
              href={feature.path}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                active
                  ? 'bg-teal-50 text-teal-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              {feature.name}
            </Link>
          )
        })}

        {/* Categories with dropdowns */}
        {FEATURE_CATEGORIES.map((category) => {
          const categoryFeatures = category.features.filter((f) => !f.enabled)

          if (categoryFeatures.length === 0) return null

          return (
            <DropdownMenu key={category.id}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    'px-3 py-2 text-sm font-medium transition-colors',
                    'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  {category.name}
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {categoryFeatures.map((feature) => {
                  return (
                    <DropdownMenuItem
                      key={feature.id}
                      disabled
                      className="cursor-not-allowed opacity-60"
                    >
                      <span className="flex-1">{feature.name}</span>
                      <Badge variant="secondary" className="text-xs ml-2">
                        Soon
                      </Badge>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        })}
      </>
    )
  }

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  const MobileNavLinks = () => {
    const enabledFeatures = FEATURES.filter((f) => f.enabled)

    return (
      <>
        {/* Enabled features - direct links */}
        {enabledFeatures.length > 0 && (
          <div className="mb-4">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Available
            </div>
            {enabledFeatures.map((feature) => {
              const active = isActive(feature.path)
              return (
                <Link
                  key={feature.id}
                  href={feature.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block px-3 py-2.5 rounded-md text-sm font-medium transition-colors mb-1',
                    active
                      ? 'bg-teal-50 text-teal-700 font-semibold border border-teal-200'
                      : 'text-gray-900 hover:bg-gray-100 bg-white border border-gray-200'
                  )}
                >
                  {feature.name}
                </Link>
              )
            })}
          </div>
        )}

        {/* Categories */}
        {FEATURE_CATEGORIES.map((category) => {
          const CategoryIcon = category.icon
          const categoryFeatures = category.features.filter((f) => !f.enabled)

          if (categoryFeatures.length === 0) return null

          const isOpen = openCategories[category.id] || false

          return (
            <Collapsible
              key={category.id}
              open={isOpen}
              onOpenChange={() => toggleCategory(category.id)}
            >
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-100 bg-white border border-gray-200 mb-1">
                  <div className="flex items-center gap-2">
                    <CategoryIcon className="w-4 h-4" />
                    <span>{category.name}</span>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="pl-4 mt-1 space-y-1">
                  {categoryFeatures.map((feature) => {
                    return (
                      <Link
                        key={feature.id}
                        href={feature.path}
                        onClick={(e) => {
                          e.preventDefault()
                          setMobileMenuOpen(false)
                        }}
                        className={cn(
                          'flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors',
                          'text-gray-600 cursor-not-allowed hover:bg-gray-50',
                          'bg-gray-50 border border-gray-200'
                        )}
                      >
                        <span className="text-gray-700">{feature.name}</span>
                        <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-700">
                          Soon
                        </Badge>
                      </Link>
                    )
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </>
    )
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
            <Logo className="w-6 h-6 sm:w-8 sm:h-8" />
            <span className="text-lg sm:text-xl font-semibold text-gray-900">ImageMark</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-1 lg:flex-1 lg:justify-center lg:mx-8">
            <NavLinks />
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-white">
              <div className="flex flex-col gap-4 mt-8">
                <div className="flex items-center space-x-2 mb-4">
                  <Logo className="w-6 h-6" />
                  <span className="text-lg font-semibold text-gray-900">ImageMark</span>
                </div>
                <div className="flex flex-col gap-1">
                  <MobileNavLinks />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
