import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { Product, HistoryEntry } from '@/types'
import { triggerConfetti } from '@/lib/confetti'

interface SwagContextType {
  products: Product[]
  history: HistoryEntry[]
  withdrawItem: (
    productId: string,
    user: string,
    destination: string,
    date: Date,
  ) => void
  addProduct: (product: Omit<Product, 'id'>) => void
  isLoading: boolean
}

const SwagContext = createContext<SwagContextType | undefined>(undefined)

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Kit Onboarding Deluxe',
    category: 'RH',
    imageQuery: 'welcome kit gift box',
    stock: 12,
    description: 'Um kit completo para receber novos colaboradores com estilo.',
  },
  {
    id: '2',
    name: 'Garrafa Térmica Adapta',
    category: 'Institucional',
    imageQuery: 'water bottle insulated',
    stock: 4,
    description: 'Mantém sua bebida gelada por 24h ou quente por 12h.',
  },
  {
    id: '3',
    name: 'Caderno Moleskine Premium',
    category: 'Vendas',
    imageQuery: 'notebook black',
    stock: 25,
    description: 'Caderno de anotações de alta qualidade para suas ideias.',
  },
  {
    id: '4',
    name: 'Mochila Tech Anti-furto',
    category: 'Tech',
    imageQuery: 'backpack tech',
    stock: 0,
    description: 'Segurança e praticidade para transportar seus gadgets.',
  },
  {
    id: '5',
    name: 'Camiseta Algodão Egípcio',
    category: 'Institucional',
    imageQuery: 't-shirt black folded',
    stock: 8,
    description: 'Conforto inigualável com algodão de fibra longa.',
  },
  {
    id: '6',
    name: 'Powerbank Wireless 10k',
    category: 'Tech',
    imageQuery: 'powerbank wireless',
    stock: 3,
    description: 'Carregamento sem fio rápido para nunca ficar sem bateria.',
  },
  {
    id: '7',
    name: 'Copo Stanley Personalizado',
    category: 'Vendas',
    imageQuery: 'tumbler cup',
    stock: 15,
    description: 'O copo mais desejado do momento, com a marca da empresa.',
  },
  {
    id: '8',
    name: 'Boné Trucker Adapta',
    category: 'Marketing',
    imageQuery: 'cap trucker hat',
    stock: 2,
    description: 'Estilo despojado para eventos e dia a dia.',
  },
  {
    id: '9',
    name: 'Ecobag Sustentável',
    category: 'RH',
    imageQuery: 'tote bag canvas',
    stock: 30,
    description: 'Sacola ecológica resistente e versátil.',
  },
  {
    id: '10',
    name: 'Adesivos Pack Dev',
    category: 'Tech',
    imageQuery: 'laptop stickers',
    stock: 50,
    description: 'Pacote de adesivos variados para personalizar seu setup.',
  },
]

export function SwagProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load from local storage
    const loadData = () => {
      try {
        const storedProducts = localStorage.getItem('adapta-swag-products')
        const storedHistory = localStorage.getItem('adapta-swag-history')

        if (storedProducts) {
          setProducts(JSON.parse(storedProducts))
        } else {
          setProducts(INITIAL_PRODUCTS)
        }

        if (storedHistory) {
          setHistory(JSON.parse(storedHistory))
        }
      } catch (error) {
        console.error('Failed to load data from local storage', error)
        setProducts(INITIAL_PRODUCTS)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('adapta-swag-products', JSON.stringify(products))
      localStorage.setItem('adapta-swag-history', JSON.stringify(history))
    }
  }, [products, history, isLoading])

  const withdrawItem = (
    productId: string,
    user: string,
    destination: string,
    date: Date,
  ) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, stock: Math.max(0, p.stock - 1) } : p,
      ),
    )

    const product = products.find((p) => p.id === productId)
    if (product) {
      const newEntry: HistoryEntry = {
        id: crypto.randomUUID(),
        productId,
        productName: product.name,
        productImageQuery: product.imageQuery,
        user,
        destination,
        date: date.toISOString(),
      }
      setHistory((prev) => [newEntry, ...prev])
      triggerConfetti()
    }
  }

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
    }
    setProducts((prev) => [newProduct, ...prev])
  }

  return (
    <SwagContext.Provider
      value={{ products, history, withdrawItem, addProduct, isLoading }}
    >
      {children}
    </SwagContext.Provider>
  )
}

export default function useSwagStore() {
  const context = useContext(SwagContext)
  if (context === undefined) {
    throw new Error('useSwagStore must be used within a SwagProvider')
  }
  return context
}
