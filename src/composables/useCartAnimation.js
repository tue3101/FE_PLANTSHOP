

export function useCartAnimation() {

    const createFlyAnimation = (event, productImage = null) => {
        // Tìm button
        const button = event?.currentTarget || event?.target
        if (!button) return

        // Tìm hình ảnh sản phẩm
        let imageElement = null
        
        // Kiểm tra nếu productImage là HTMLElement hợp lệ (từ ProductDetailPage)
        if (productImage && productImage instanceof HTMLElement && typeof productImage.getBoundingClientRect === 'function') {
            imageElement = productImage
        } else {
            // Tự tìm hình ảnh trong product card (từ ProductList)
            const productCard = button.closest('.product-card') || button.closest('[class*="product"]')
            if (productCard) {
                imageElement = productCard.querySelector('img')
            } else {
                // Fallback: tìm hình ảnh gần button nhất (cho ProductDetailPage nếu không có productImage)
                imageElement = button.closest('.product-detail-image')?.querySelector('img') ||
                              document.querySelector('.product-detail-image img') ||
                              document.querySelector('img[alt*="' + (productImage?.alt || '') + '"]')
            }
        }
        
        if (!imageElement) {
            console.warn('Không tìm thấy hình ảnh sản phẩm để tạo animation')
            return
        }

        const imageRect = imageElement.getBoundingClientRect()

        // Tìm icon giỏ hàng trong header
        const cartIcon = document.querySelector('.cart-icon-container')
        if (!cartIcon) {
            // Fallback: tìm bằng class khác hoặc data attribute
            const fallbackCartIcon = document.querySelector('[data-cart-icon]') || 
                                    document.querySelector('.cart-icon') ||
                                    document.querySelector('[aria-label*="cart" i]')
            if (!fallbackCartIcon) {
                console.warn('Không tìm thấy icon giỏ hàng để tạo animation')
                return
            }
            // Sử dụng fallback
            animateToElement(imageElement, imageRect, fallbackCartIcon)
            return
        }

        animateToElement(imageElement, imageRect, cartIcon)
    }

   
    const animateToElement = (imageElement, imageRect, targetElement) => {
        const targetRect = targetElement.getBoundingClientRect()

        // Clone hình ảnh sản phẩm
        const clonedImage = imageElement.cloneNode(true)
        clonedImage.style.cssText = `
            width: ${imageRect.width}px;
            height: ${imageRect.height}px;
            object-fit: contain;
        `

        // Tính toán điểm giữa (để tạo đường cong)
        const startX = imageRect.left + imageRect.width / 2
        const startY = imageRect.top + imageRect.height / 2
        const endX = targetRect.left + targetRect.width / 2
        const endY = targetRect.top + targetRect.height / 2
        const midX = (startX + endX) / 2
        const midY = Math.min(startY, endY) - 50 // Điểm cao nhất của đường cong

        // Tạo element container
        const flyImage = document.createElement('div')
        flyImage.appendChild(clonedImage)
        flyImage.style.cssText = `
            position: fixed;
            left: ${startX}px;
            top: ${startY}px;
            width: ${imageRect.width}px;
            height: ${imageRect.height}px;
            z-index: 9999;
            pointer-events: none;
            transform: translate(-50%, -50%);
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            background: white;
            padding: 4px;
        `
        flyImage.className = 'fly-to-cart'
        document.body.appendChild(flyImage)

        // Tạo keyframes animation giống Shopee
        const keyframes = [
            {
                left: `${startX}px`,
                top: `${startY}px`,
                transform: 'translate(-50%, -50%) scale(1)',
                opacity: 1
            },
            {
                left: `${midX}px`,
                top: `${midY}px`,
                transform: 'translate(-50%, -50%) scale(0.6)',
                opacity: 0.8,
                offset: 0.5
            },
            {
                left: `${endX}px`,
                top: `${endY}px`,
                transform: 'translate(-50%, -50%) scale(0.2)',
                opacity: 0.3
            }
        ]

        const animation = flyImage.animate(keyframes, {
            duration: 800,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            fill: 'forwards'
        })

        // Hiệu ứng bounce cho icon giỏ hàng khi nhận được sản phẩm
        animation.onfinish = () => {
            // Thêm class bounce cho icon giỏ hàng
            targetElement.classList.add('cart-bounce')
            setTimeout(() => {
                targetElement.classList.remove('cart-bounce')
            }, 600)

            // Xóa fly image
            if (flyImage.parentNode) {
                flyImage.remove()
            }
        }
    }

    return {
        createFlyAnimation
    }
}


