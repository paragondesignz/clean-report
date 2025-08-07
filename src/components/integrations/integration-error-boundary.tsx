'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

interface IntegrationErrorBoundaryProps {
  children: React.ReactNode
  integrationName: string
}

interface IntegrationErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class IntegrationErrorBoundary extends React.Component<
  IntegrationErrorBoundaryProps,
  IntegrationErrorBoundaryState
> {
  constructor(props: IntegrationErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): IntegrationErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.log(`${this.props.integrationName} integration error:`, error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span>{this.props.integrationName}</span>
            </CardTitle>
            <CardDescription>
              Integration temporarily unavailable
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This integration is not fully configured yet. Other integrations will continue to work normally.
            </p>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}