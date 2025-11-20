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

    // Format conversion combinations for SEO
    const formatConversions = [
      { from: 'PNG', to: 'JPEG', label: 'PNG to JPEG', path: '/convert?from=png&to=jpeg' },
      { from: 'JPEG', to: 'PNG', label: 'JPEG to PNG', path: '/convert?from=jpeg&to=png' },
      { from: 'PNG', to: 'WebP', label: 'PNG to WebP', path: '/convert?from=png&to=webp' },
      { from: 'JPEG', to: 'WebP', label: 'JPEG to WebP', path: '/convert?from=jpeg&to=webp' },
      { from: 'PNG', to: 'AVIF', label: 'PNG to AVIF', path: '/convert?from=png&to=avif' },
      { from: 'JPEG', to: 'AVIF', label: 'JPEG to AVIF', path: '/convert?from=jpeg&to=avif' },
      { from: 'WebP', to: 'PNG', label: 'WebP to PNG', path: '/convert?from=webp&to=png' },
      { from: 'WebP', to: 'JPEG', label: 'WebP to JPEG', path: '/convert?from=webp&to=jpeg' },
    ]

    // Background removal options for SEO
    const backgroundRemovalOptions = [
      { format: 'PNG', label: 'Remove Background from PNG', path: '/remove-background?format=png' },
      {
        format: 'JPEG',
        label: 'Remove Background from JPEG',
        path: '/remove-background?format=jpeg',
      },
      {
        format: 'WebP',
        label: 'Remove Background from WebP',
        path: '/remove-background?format=webp',
      },
    ]

    // Supported formats for Resize and Optimize
    const supportedFormats = [
      { value: 'png', label: 'PNG' },
      { value: 'jpeg', label: 'JPEG' },
      { value: 'webp', label: 'WebP' },
      { value: 'avif', label: 'AVIF' },
      { value: 'gif', label: 'GIF' },
    ]

    // Resize options for SEO
    const resizeOptions = [
      ...supportedFormats.map((format) => ({
        format: format.value,
        label: `Resize ${format.label}`,
        path: `/resize?format=${format.value}`,
      })),
      { format: 'bulk', label: 'Bulk Resize', path: '/resize?bulk=true' },
    ]

    // Optimize options for SEO
    const optimizeOptions = [
      ...supportedFormats.map((format) => ({
        format: format.value,
        label: `Optimize ${format.label}`,
        path: `/optimize?format=${format.value}`,
      })),
      { format: 'bulk', label: 'Bulk Optimization', path: '/optimize?bulk=true' },
    ]

    return (
      <>
        {/* Resize dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'px-3 py-2 text-sm font-medium transition-colors',
                isActive('/resize')
                  ? 'bg-teal-50 text-teal-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              Resize
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-64 bg-white border border-gray-200 shadow-lg rounded-lg p-1"
          >
            {resizeOptions.map((option) => (
              <DropdownMenuItem key={option.path} asChild>
                <Link
                  href={option.path}
                  className="text-gray-700 hover:bg-gray-50 rounded-md px-2 py-1.5"
                >
                  {option.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Optimize dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'px-3 py-2 text-sm font-medium transition-colors',
                isActive('/optimize')
                  ? 'bg-teal-50 text-teal-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              Optimize
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-64 bg-white border border-gray-200 shadow-lg rounded-lg p-1"
          >
            {optimizeOptions.map((option) => (
              <DropdownMenuItem key={option.path} asChild>
                <Link
                  href={option.path}
                  className="text-gray-700 hover:bg-gray-50 rounded-md px-2 py-1.5"
                >
                  {option.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Enabled features - with dropdowns for SEO */}
        {enabledFeatures.map((feature) => {
          const active = isActive(feature.path)

          // Convert feature - show format conversion dropdown
          if (feature.id === 'convert') {
            return (
              <DropdownMenu key={feature.id}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      'px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'bg-teal-50 text-teal-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    {feature.name}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-64 bg-white border border-gray-200 shadow-lg rounded-lg p-1"
                >
                  <DropdownMenuItem asChild>
                    <Link
                      href={feature.path}
                      className="font-semibold text-gray-900 hover:bg-gray-50 rounded-md px-2 py-1.5"
                    >
                      All Formats
                    </Link>
                  </DropdownMenuItem>
                  <div className="border-t border-gray-200 my-1" />
                  {formatConversions.map((conversion) => (
                    <DropdownMenuItem key={conversion.path} asChild>
                      <Link
                        href={conversion.path}
                        className="text-gray-700 hover:bg-gray-50 rounded-md px-2 py-1.5"
                      >
                        {conversion.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }

          // Remove Background feature - show format-specific dropdown
          if (feature.id === 'background-removal') {
            return (
              <DropdownMenu key={feature.id}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      'px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'bg-teal-50 text-teal-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    {feature.name}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-64 bg-white border border-gray-200 shadow-lg rounded-lg p-1"
                >
                  <DropdownMenuItem asChild>
                    <Link
                      href={feature.path}
                      className="font-semibold text-gray-900 hover:bg-gray-50 rounded-md px-2 py-1.5"
                    >
                      All Images
                    </Link>
                  </DropdownMenuItem>
                  <div className="border-t border-gray-200 my-1" />
                  {backgroundRemovalOptions.map((option) => (
                    <DropdownMenuItem key={option.path} asChild>
                      <Link
                        href={option.path}
                        className="text-gray-700 hover:bg-gray-50 rounded-md px-2 py-1.5"
                      >
                        {option.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }

          // Other enabled features - direct links
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

        {/* Categories with dropdowns - exclude 'editing', 'batch', and 'optimization' categories */}
        {FEATURE_CATEGORIES.filter(
          (category) =>
            category.id !== 'editing' && category.id !== 'batch' && category.id !== 'optimization'
        ).map((category) => {
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
              <DropdownMenuContent
                align="start"
                className="w-56 bg-white border border-gray-200 shadow-lg rounded-lg p-1"
              >
                {categoryFeatures.map((feature) => {
                  return (
                    <DropdownMenuItem
                      key={feature.id}
                      disabled
                      className="cursor-not-allowed opacity-60 rounded-md px-2 py-1.5"
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

    // Format conversion combinations for SEO
    const formatConversions = [
      { from: 'PNG', to: 'JPEG', label: 'PNG to JPEG', path: '/convert?from=png&to=jpeg' },
      { from: 'JPEG', to: 'PNG', label: 'JPEG to PNG', path: '/convert?from=jpeg&to=png' },
      { from: 'PNG', to: 'WebP', label: 'PNG to WebP', path: '/convert?from=png&to=webp' },
      { from: 'JPEG', to: 'WebP', label: 'JPEG to WebP', path: '/convert?from=jpeg&to=webp' },
      { from: 'PNG', to: 'AVIF', label: 'PNG to AVIF', path: '/convert?from=png&to=avif' },
      { from: 'JPEG', to: 'AVIF', label: 'JPEG to AVIF', path: '/convert?from=jpeg&to=avif' },
      { from: 'WebP', to: 'PNG', label: 'WebP to PNG', path: '/convert?from=webp&to=png' },
      { from: 'WebP', to: 'JPEG', label: 'WebP to JPEG', path: '/convert?from=webp&to=jpeg' },
    ]

    // Background removal options for SEO
    const backgroundRemovalOptions = [
      { format: 'PNG', label: 'Remove Background from PNG', path: '/remove-background?format=png' },
      {
        format: 'JPEG',
        label: 'Remove Background from JPEG',
        path: '/remove-background?format=jpeg',
      },
      {
        format: 'WebP',
        label: 'Remove Background from WebP',
        path: '/remove-background?format=webp',
      },
    ]

    // Supported formats for Resize and Optimize
    const supportedFormats = [
      { value: 'png', label: 'PNG' },
      { value: 'jpeg', label: 'JPEG' },
      { value: 'webp', label: 'WebP' },
      { value: 'avif', label: 'AVIF' },
      { value: 'gif', label: 'GIF' },
    ]

    // Resize options for SEO
    const resizeOptions = [
      ...supportedFormats.map((format) => ({
        format: format.value,
        label: `Resize ${format.label}`,
        path: `/resize?format=${format.value}`,
      })),
      { format: 'bulk', label: 'Bulk Resize', path: '/resize?bulk=true' },
    ]

    // Optimize options for SEO
    const optimizeOptions = [
      ...supportedFormats.map((format) => ({
        format: format.value,
        label: `Optimize ${format.label}`,
        path: `/optimize?format=${format.value}`,
      })),
      { format: 'bulk', label: 'Bulk Optimization', path: '/optimize?bulk=true' },
    ]

    return (
      <>
        {/* Resize dropdown */}
        <Collapsible
          open={openCategories['resize'] || false}
          onOpenChange={() => toggleCategory('resize')}
        >
          <CollapsibleTrigger className="w-full">
            <div
              className={cn(
                'flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors mb-1',
                isActive('/resize')
                  ? 'bg-teal-50 text-teal-700 font-semibold border border-teal-200'
                  : 'text-gray-900 hover:bg-gray-100 bg-white border border-gray-200'
              )}
            >
              <span>Resize</span>
              {openCategories['resize'] ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="pl-4 mt-1 space-y-1">
              {resizeOptions.map((option) => (
                <Link
                  key={option.path}
                  href={option.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 bg-gray-50 border border-gray-200"
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Optimize dropdown */}
        <Collapsible
          open={openCategories['optimize'] || false}
          onOpenChange={() => toggleCategory('optimize')}
        >
          <CollapsibleTrigger className="w-full">
            <div
              className={cn(
                'flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors mb-1',
                isActive('/optimize')
                  ? 'bg-teal-50 text-teal-700 font-semibold border border-teal-200'
                  : 'text-gray-900 hover:bg-gray-100 bg-white border border-gray-200'
              )}
            >
              <span>Optimize</span>
              {openCategories['optimize'] ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="pl-4 mt-1 space-y-1">
              {optimizeOptions.map((option) => (
                <Link
                  key={option.path}
                  href={option.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 bg-gray-50 border border-gray-200"
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Enabled features - with collapsible menus for SEO */}
        {enabledFeatures.length > 0 && (
          <div className="mb-4">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Available
            </div>
            {enabledFeatures.map((feature) => {
              const active = isActive(feature.path)

              // Convert feature - show format conversion options
              if (feature.id === 'convert') {
                const isOpen = openCategories[feature.id] || false
                return (
                  <Collapsible
                    key={feature.id}
                    open={isOpen}
                    onOpenChange={() => toggleCategory(feature.id)}
                  >
                    <CollapsibleTrigger className="w-full">
                      <div
                        className={cn(
                          'flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors mb-1',
                          active
                            ? 'bg-teal-50 text-teal-700 font-semibold border border-teal-200'
                            : 'text-gray-900 hover:bg-gray-100 bg-white border border-gray-200'
                        )}
                      >
                        <span>{feature.name}</span>
                        {isOpen ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="pl-4 mt-1 space-y-1">
                        <Link
                          href={feature.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 bg-gray-50 border border-gray-200"
                        >
                          All Formats
                        </Link>
                        {formatConversions.map((conversion) => (
                          <Link
                            key={conversion.path}
                            href={conversion.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 bg-gray-50 border border-gray-200"
                          >
                            {conversion.label}
                          </Link>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )
              }

              // Remove Background feature - show format-specific options
              if (feature.id === 'background-removal') {
                const isOpen = openCategories[feature.id] || false
                return (
                  <Collapsible
                    key={feature.id}
                    open={isOpen}
                    onOpenChange={() => toggleCategory(feature.id)}
                  >
                    <CollapsibleTrigger className="w-full">
                      <div
                        className={cn(
                          'flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors mb-1',
                          active
                            ? 'bg-teal-50 text-teal-700 font-semibold border border-teal-200'
                            : 'text-gray-900 hover:bg-gray-100 bg-white border border-gray-200'
                        )}
                      >
                        <span>{feature.name}</span>
                        {isOpen ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="pl-4 mt-1 space-y-1">
                        <Link
                          href={feature.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 bg-gray-50 border border-gray-200"
                        >
                          All Images
                        </Link>
                        {backgroundRemovalOptions.map((option) => (
                          <Link
                            key={option.path}
                            href={option.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 bg-gray-50 border border-gray-200"
                          >
                            {option.label}
                          </Link>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )
              }

              // Other enabled features - direct links
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

        {/* Categories - exclude 'editing', 'batch', and 'optimization' categories */}
        {FEATURE_CATEGORIES.filter(
          (category) =>
            category.id !== 'editing' && category.id !== 'batch' && category.id !== 'optimization'
        ).map((category) => {
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
