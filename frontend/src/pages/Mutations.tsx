import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Badge } from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { mutationsList as fallbackList } from "../data/mockData"
import { useSearchParams, useNavigate } from "react-router-dom"
import { RefreshCw, ArrowRight } from "lucide-react"

export function Mutations() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const expId = searchParams.get("id") || localStorage.getItem("active_experiment_id") || "EXP-8472"

  const [loading, setLoading] = useState(true)
  const [mutations, setMutations] = useState<any[]>([])
  const [experiment, setExperiment] = useState<any>(null)

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || ""
    setLoading(true)

    fetch(`${apiUrl}/api/experiments/${expId}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found")
        return res.json()
      })
      .then(data => {
        setExperiment(data)
        if (data.mutations && data.mutations.length > 0) {
          const mapped = data.mutations.map((m: any) => ({
            id: m.id,
            baselineId: data.id,
            parameter: m.parameter,
            original: m.original_value,
            mutated: m.mutated_value,
            mutationPercent: m.mutation_percent,
            status: m.status,
            seed: m.seed
          }))
          setMutations(mapped)
        } else {
          setMutations(fallbackList)
        }
      })
      .catch(err => {
        console.warn("Backend unavailable, using fallback mock mutations:", err)
        setMutations(fallbackList)
      })
      .finally(() => setLoading(false))
  }, [expId])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Generated Mutations</h2>
          <p className="text-gray-500 mt-2 text-sm">
            Comprehensive log of all parameter mutations generated for {expId} ({experiment?.scheme || "ML-KEM-768"}).
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(`/results?id=${expId}`)}>
          View Results <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Mutation Log ({mutations.length} mutations)</CardTitle>
            {loading && <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mutation ID</TableHead>
                <TableHead>Parameter</TableHead>
                <TableHead>Original</TableHead>
                <TableHead>Mutated</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Seed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mutations.map((mut) => (
                <TableRow key={mut.id}>
                  <TableCell className="font-mono text-xs">{mut.id}</TableCell>
                  <TableCell className="font-mono">{mut.parameter}</TableCell>
                  <TableCell className="font-mono text-gray-500">{mut.original}</TableCell>
                  <TableCell className="font-mono font-medium">{mut.mutated}</TableCell>
                  <TableCell>{mut.mutationPercent}</TableCell>
                  <TableCell>
                    {mut.status === "Valid" ? (
                      <Badge variant="success">Valid</Badge>
                    ) : mut.status === "Warning" ? (
                      <Badge variant="warning">Warning</Badge>
                    ) : (
                      <Badge variant="danger">Invalid</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-gray-400">{mut.seed}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

