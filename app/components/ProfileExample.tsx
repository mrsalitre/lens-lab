"use client"

import { client } from '../lib/client'
import { useState, useEffect } from 'react'
import { fetchAccount } from "@lens-protocol/client/actions";
import type { Account } from '@lens-protocol/client';
import { useSearchParams } from 'next/navigation'

export function ProfileExample() {
  const searchParams = useSearchParams()
  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function getAccount() {
      const profileId = searchParams.get('profileId')
      
      if (!profileId) {
        setError('No profile ID provided')
        setLoading(false)
        return
      }

      try {
        const result = await fetchAccount(client, {
          legacyProfileId: profileId
        });
        
        if (result.isErr()) {
          console.error('Failed to fetch account:', result.error)
          setError('Failed to fetch account')
          return;
        }
        console.log(result.value)

        setAccount(result.value)
      } catch (error) {
        console.error('Failed to fetch account:', error)
        setError('An error occurred while fetching the account')
      } finally {
        setLoading(false)
      }
    }

    getAccount()
  }, [searchParams])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!account) return <div>Account not found</div>

  return (
    <div>
      <h1>{account.username?.value || 'Unnamed Account'}</h1>
    </div>
  )
} 