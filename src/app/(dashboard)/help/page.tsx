"use client"

import { useState } from "react"
import { 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  ChevronDown, 
  ChevronRight,
  Search,
  BookOpen,
  Video,
  FileText,
  ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

const faqs: FAQ[] = [
  {
    id: "1",
    question: "How do I create my first job?",
    answer: "To create your first job, click the 'New Job' button in the top right corner of your dashboard, or navigate to the Jobs page and click 'Add Job'. Fill in the client details, job description, and scheduled date/time.",
    category: "Getting Started"
  },
  {
    id: "2", 
    question: "How do I add photos to a job?",
    answer: "Open the job details page, then navigate to the Tasks section. Click on a specific task and use the photo upload area to add before/after photos. You can upload multiple photos per task.",
    category: "Jobs & Tasks"
  },
  {
    id: "3",
    question: "How do I generate a professional report?",
    answer: "After completing job tasks and uploading photos, go to the job details page and click 'Generate Report'. The system will create a professional PDF report with all task details, photos, and client information.",
    category: "Reports"
  },
  {
    id: "4",
    question: "Can I customize my company branding?",
    answer: "Yes! Go to Settings → Company Profile to upload your logo, set brand colors, and customize email templates. This branding will appear on all reports and communications.",
    category: "Settings"
  },
  {
    id: "5",
    question: "How do I set up recurring jobs?",
    answer: "Navigate to the Recurring Jobs page and click 'Add Recurring Job'. Set the frequency (daily, weekly, monthly), client details, and the system will automatically create jobs based on your schedule.",
    category: "Recurring Jobs"
  },
  {
    id: "6",
    question: "How do I track my supplies?",
    answer: "Use the Supplies page to add your cleaning supplies, set current stock levels, and low stock thresholds. The system will notify you when supplies are running low.",
    category: "Supplies"
  },
  {
    id: "7",
    question: "Can clients book appointments online?",
    answer: "Yes! Enable the booking portal in Settings, then share your unique booking link with clients. They can request appointments online, which will appear in your Booking Requests section.",
    category: "Client Features"
  },
  {
    id: "8",
    question: "How do I export my data?",
    answer: "Go to Settings → Data Export to download your clients, jobs, and reports data in CSV format. You can also generate financial reports for accounting purposes.",
    category: "Data Management"
  }
]

const categories = Array.from(new Set(faqs.map(faq => faq.category)))

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("All")

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = searchQuery === "" || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <HelpCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Help & Support</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions, browse our guides, or get in touch with our support team
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <BookOpen className="w-8 h-8 text-green-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">User Guide</h3>
          <p className="text-sm text-gray-600 mb-4">
            Step-by-step instructions for using all features
          </p>
          <Button variant="outline" size="sm" className="w-full">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Guide
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <Video className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Video Tutorials</h3>
          <p className="text-sm text-gray-600 mb-4">
            Watch video tutorials on key features
          </p>
          <Button variant="outline" size="sm" className="w-full">
            <ExternalLink className="w-4 h-4 mr-2" />
            Watch Videos
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <MessageCircle className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
          <p className="text-sm text-gray-600 mb-4">
            Get instant help from our support team
          </p>
          <Button variant="outline" size="sm" className="w-full">
            <MessageCircle className="w-4 h-4 mr-2" />
            Start Chat
          </Button>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === "All"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        <div className="divide-y divide-gray-200">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq) => (
              <div key={faq.id} className="p-6">
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">{faq.question}</h3>
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {faq.category}
                    </span>
                  </div>
                  {expandedFAQ === faq.id ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                {expandedFAQ === faq.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No FAQs found matching your search.</p>
              <p className="text-sm text-gray-400 mt-1">Try different keywords or browse all categories.</p>
            </div>
          )}
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Still Need Help?</h2>
        <p className="text-gray-600 mb-6">
          Can't find what you're looking for? Our support team is here to help.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <Mail className="w-6 h-6 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Email Support</p>
              <p className="text-sm text-gray-600">support@cleanreport.com</p>
              <p className="text-xs text-gray-500">Response within 24 hours</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <Phone className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">Phone Support</p>
              <p className="text-sm text-gray-600">1-800-CLEAN-REPORT</p>
              <p className="text-xs text-gray-500">Mon-Fri 9AM-6PM EST</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}